import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { PrestamosService } from './services/prestamos';

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
  ];

  activeLoans: Prestamo[] = [];
  activeLoansCount: number = 0;

  constructor(
    private router: Router,
    private prestamosService: PrestamosService,
  ) {
    App.addListener('backButton', () => {
      if (this.router.url === '/home') {
        App.exitApp();
      } else {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          this.router.navigateByUrl('/home');
        }
      }
    });
  }

  ngOnInit() {
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
