import { Injectable } from '@angular/core';
import { NativeBiometric } from 'capacitor-native-biometric';

interface ConfiguracionBiometria {
  habilitada: boolean;
  tiempoBloqueo: number; // en segundos
}

@Injectable({
  providedIn: 'root'
})
export class BiometriaService {
  private configKey = 'config_biometria';
  private ultimaSalidaKey = 'ultima_salida_app';
  private activacionUsuarioKey = 'biometria_activada_usuario';
  
  constructor() {
    this.inicializarConfiguracion();
  }

  private inicializarConfiguracion() {
    const configGuardada = localStorage.getItem(this.configKey);
    if (!configGuardada) {
      const configPredeterminada: ConfiguracionBiometria = {
        habilitada: false,
        tiempoBloqueo: 0
      };
      localStorage.setItem(this.configKey, JSON.stringify(configPredeterminada));
    }

    // Evita bloqueos automáticos con estado viejo de versiones previas.
    const configActual = this.obtenerConfiguracion();
    if (!this.fueActivadaPorUsuario() && configActual.habilitada) {
      configActual.habilitada = false;
      localStorage.setItem(this.configKey, JSON.stringify(configActual));
    }
  }

  async autenticar(): Promise<boolean> {
    try {
      const disponible = await NativeBiometric.isAvailable({ useFallback: true });
      if (!disponible?.isAvailable) {
        return false;
      }

      await NativeBiometric.verifyIdentity({
        reason: 'Usa tu huella dactilar para acceder a la aplicación',
        title: 'Verificación de identidad',
        subtitle: 'Se requiere tu huella dactilar',
        description: 'Confirma tu identidad para continuar',
        negativeButtonText: 'Cancelar',
        useFallback: true,
        maxAttempts: 3,
      });

      return true;
    } catch (e) {
      console.error('Error en autenticación biométrica:', e);
      return false;
    }
  }

  obtenerConfiguracion(): ConfiguracionBiometria {
    const configGuardada = localStorage.getItem(this.configKey);
    const config = configGuardada ? JSON.parse(configGuardada) : {
      habilitada: false,
      tiempoBloqueo: 0
    };

    if (!this.fueActivadaPorUsuario()) {
      config.habilitada = false;
    }

    return config;
  }

  guardarConfiguracion(config: ConfiguracionBiometria) {
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  establecerActivacionUsuario(activa: boolean) {
    localStorage.setItem(this.activacionUsuarioKey, activa ? '1' : '0');
    if (!activa) {
      this.limpiarSalida();
    }
  }

  private fueActivadaPorUsuario(): boolean {
    return localStorage.getItem(this.activacionUsuarioKey) === '1';
  }

  registrarSalida() {
    const ahora = new Date().getTime();
    localStorage.setItem(this.ultimaSalidaKey, ahora.toString());
  }

  necesitaBloqueo(): boolean {
    const config = this.obtenerConfiguracion();
    if (!config.habilitada || !this.fueActivadaPorUsuario()) {
      return false;
    }

    const ultimaSalidaStr = localStorage.getItem(this.ultimaSalidaKey);
    if (!ultimaSalidaStr) {
      return false;
    }

    const ultimaSalida = parseInt(ultimaSalidaStr, 10);
    const ahora = new Date().getTime();
    const tiempoTranscurrido = (ahora - ultimaSalida) / 1000;
    
    return tiempoTranscurrido >= config.tiempoBloqueo;
  }

  limpiarSalida() {
    localStorage.removeItem(this.ultimaSalidaKey);
  }
}
