import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-prestamo',
  templateUrl: './prestamo.page.html',
  styleUrls: ['./prestamo.page.scss'],
  standalone: false,
})
export class PrestamoPage implements OnInit {
  cargando = true;
  errorMsg = '';
  prestamo: any[] = [];
  prestamosFiltrados: any[] = [];
  soloActivos = false;

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

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.api.getPrestamos();
      let prestamos = data || [];

      if (this.soloActivos) {
        prestamos = prestamos.filter((p: any) => !p.FechaDevolucion);
      }

      this.prestamo = prestamos.sort(
        (a: any, b: any) => a.IdPrestamo - b.IdPrestamo,
      );
      this.prestamosFiltrados = [...this.prestamo];
      this.cargando = false;
      if (event) event.target.complete();
    } catch (e: any) {
      console.log('ERROR NATIVO:', e);
      this.errorMsg = 'No se pudo cargar la información (nativo).';
      alert(JSON.stringify(e, null, 2));
    } finally {
      this.cargando = false;
      if (event) event.target.complete();
    }
  }
}
