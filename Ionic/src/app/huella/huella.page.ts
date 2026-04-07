import { Component, OnInit } from '@angular/core';
import { BiometriaService } from '../services';
import { ToastController } from '@ionic/angular';

interface ConfiguracionBiometria {
  habilitada: boolean;
  tiempoBloqueo: number;
}

interface TiempoOpcion {
  label: string;
  segundos: number;
}

@Component({
  selector: 'app-huella',
  templateUrl: './huella.page.html',
  styleUrls: ['./huella.page.scss'],
  standalone: false,
})
export class HuellaPage implements OnInit {
  configuracion: ConfiguracionBiometria = {
    habilitada: false,
    tiempoBloqueo: 0
  };

  tiemposDisponibles: TiempoOpcion[] = [
    { label: 'Inmediatamente', segundos: 0 },
    { label: '5 minutos', segundos: 300 },
    { label: '10 minutos', segundos: 600 },
    { label: '15 minutos', segundos: 900 },
    { label: '30 minutos', segundos: 1800 }
  ];

  constructor(
    private biometriaService: BiometriaService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.configuracion = this.biometriaService.obtenerConfiguracion();
  }

  async cambiarEstadoHuella(event: any) {
    const habilitar = !!event?.detail?.checked;

    if (!habilitar) {
      this.configuracion.habilitada = false;
      this.biometriaService.establecerActivacionUsuario(false);
      this.biometriaService.guardarConfiguracion(this.configuracion);
      await this.mostrarToast('✗ Huella dactilar deshabilitada', 'medium');
      return;
    }

    this.configuracion.habilitada = true;
    this.biometriaService.establecerActivacionUsuario(true);
    this.biometriaService.guardarConfiguracion(this.configuracion);
    await this.mostrarToast('✓ Huella dactilar habilitada', 'success');
  }

  guardarConfiguracion() {
    this.biometriaService.guardarConfiguracion(this.configuracion);
    
    const mensaje = this.configuracion.habilitada 
      ? '✓ Huella dactilar habilitada'
      : '✗ Huella dactilar deshabilitada';
    
    this.mostrarToast(mensaje, 'success');
  }

  seleccionarTiempo(segundos: number) {
    this.configuracion.tiempoBloqueo = segundos;
    this.guardarConfiguracion();
    
    const tiempoOpt = this.tiemposDisponibles.find(t => t.segundos === segundos);
    this.mostrarToast(`Tiempo: ${tiempoOpt?.label}`, 'primary');
  }

  private async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}
