import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AlertController } from '@ionic/angular';
import { PrestamosService } from './services/prestamos';
import { BiometriaService } from './services';

interface Prestamo {
  IdPrestamo: number;
  FechaPrestamo: string;
  FechaDevolucion?: string | null;
  IdLibro: string;
  IdUsuario: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  menuItems = [
    {
      title: 'Autores',
      subtitle: 'Gestionar autores',
      icon: 'person-outline',
      route: '/autor',
    },
    {
      title: 'Libros',
      subtitle: 'Catálogo de libros',
      icon: 'book-outline',
      route: '/libro',
    },
    {
      title: 'Préstamos',
      subtitle: 'Préstamos y devoluciones',
      icon: 'swap-horizontal-outline',
      route: '/prestamo',
    },
    {
      title: 'Usuarios',
      subtitle: 'Administrar usuarios',
      icon: 'people-outline',
      route: '/usuario',
    },
    {
      title: 'Huella Dactilar',
      subtitle: 'Configurar huella táctil',
      icon: 'finger-print',
      route: '/huella',
    },
  ];

  activeLoans: Prestamo[] = [];
  activeLoansCount: number = 0;
  private bloqueadoPorBiometria: boolean = false;

  constructor(
    private router: Router,
    private prestamosService: PrestamosService,
    private biometriaService: BiometriaService,
    private alertController: AlertController,
  ) {
    App.addListener('backButton', () => {
      if (this.router.url === '/folder/inbox' || this.router.url === '/home') {
        this.biometriaService.registrarSalida();
        App.exitApp();
      } else {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          this.router.navigateByUrl('/folder/inbox');
        }
      }
    });

    // Usar appStateChange para detectar cambios de estado
    App.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive) {
        // App se pone en background
        this.biometriaService.registrarSalida();
      } else if (isActive && !this.bloqueadoPorBiometria) {
        // App vuelve a foreground - verificar si necesita bloqueo
        await this.verificarYBloquearConDelay();
      }
    });
  }

  private async verificarYBloquearConDelay() {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await this.verificarYBloquearPorBiometria();
  }

  private async verificarYBloquearPorBiometria() {
    const config = this.biometriaService.obtenerConfiguracion();
    
    // Solo verificar si está habilitada
    if (!config.habilitada) {
      return;
    }

    // Verificar si debe bloquearse
    if (this.biometriaService.necesitaBloqueo()) {
      this.bloqueadoPorBiometria = true;
      const autenticado = await this.biometriaService.autenticar();
      
      if (autenticado) {
        this.bloqueadoPorBiometria = false;
        this.biometriaService.limpiarSalida();
      } else {
        this.bloqueadoPorBiometria = false;
        await this.mostrarAlertaBiometria();
      }
    }
  }

  private async mostrarAlertaBiometria() {
    const alert = await this.alertController.create({
      header: 'Autenticacion requerida',
      message: 'No se pudo validar tu huella. Puedes reintentar o salir de la app.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Salir',
          role: 'cancel',
          handler: () => {
            App.exitApp();
          },
        },
        {
          text: 'Reintentar',
          handler: async () => {
            await this.verificarYBloquearPorBiometria();
          },
        },
      ],
    });

    await alert.present();
  }

  ngOnInit() {
    void this.verificarYBloquearConDelay();
    this.loadActiveLoans();
  }

  async loadActiveLoans() {
    try {
      const data = await this.prestamosService.getPrestamos();
      this.activeLoans = data.filter((p: Prestamo) => !p.FechaDevolucion);
      this.activeLoansCount = this.activeLoans.length;
    } catch (err: any) {
      console.error('Error al cargar préstamos activos', err);
    }
  }
}
