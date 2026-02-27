import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-prestamo',
  templateUrl: './prestamo.page.html',
  styleUrls: ['./prestamo.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class PrestamoPage implements OnInit {
  cargando: boolean = false;
  errorMsg: string = '';
  prestamo: any[] = [];
  prestamosFiltrados: any[] = [];
  soloActivos: boolean = false;

  constructor(
    private api: Api,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.soloActivos = params['activos'] === 'true';
      this.cargar();
    });
  }

  filtrarPrestamos(event: any) {
    const valor = event.target.value.toLowerCase();
    this.prestamosFiltrados = this.prestamo.filter((p) =>
      p.IdPrestamo.toString().toLowerCase().includes(valor),
    );
  }

  cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    this.api.getPrestamos().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        let prestamos = data || [];

        if (this.soloActivos) {
          prestamos = prestamos.filter((p) => !p.FechaDevolucion);
        }

        this.prestamo = prestamos.sort((a, b) => a.IdPrestamo - b.IdPrestamo);
        this.prestamosFiltrados = [...this.prestamo];
        this.cargando = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.log('Error de API:', err);
        this.errorMsg = 'Error al cargar, verifique la api';
        this.cargando = false;
        if (event) {
          event.target.complete();
          console.error(err);
        }
      },
    });
  }

  buscar(event: any) {
    const filtro = event.detail.value?.toLowerCase() || '';

    if (filtro === '') {
      this.prestamosFiltrados = [...this.prestamo];
    } else {
      const esNumero = /^\d+$/.test(filtro);

      this.prestamosFiltrados = this.prestamo.filter((item) => {
        if (esNumero) {
          return item.IdPrestamo?.toString() === filtro;
        } else {
          return (
            item.FechaPrestamo?.toLowerCase().includes(filtro) ||
            item.FechaDevolucion?.toLowerCase().includes(filtro) ||
            item.IdLibro?.toLowerCase().includes(filtro) ||
            item.IdUsuario?.toLowerCase().includes(filtro)
          );
        }
      });
    }
  }
}
