import { Component, OnInit } from '@angular/core';
import { Api } from '../services/api';
import { AutorListaItem } from './autor.module';

@Component({
  selector: 'app-autor',
  templateUrl: './autor.page.html',
  styleUrls: ['./autor.page.scss'],
  standalone: false,
})
export class AutorPage implements OnInit {
  cargando = true;
  errorMsg = '';
  autor: AutorListaItem[] = [];
  autoresFiltrados: AutorListaItem[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.cargar();
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.api.getAutor();
      this.autor = data || [];
      this.autoresFiltrados = [...this.autor];
    } catch (e: any) {
      console.log('ERROR NATIVO:', e);
      this.errorMsg = 'No se pudo cargar la información (nativo).';
      alert(JSON.stringify(e, null, 2));
    } finally {
      this.cargando = false;
      if (event) event.target.complete();
    }
  }

  buscar(event: any) {
    const q = (event.target.value || '').toLowerCase().trim();
    if (!q) {
      this.autoresFiltrados = [...this.autor];
      return;
    }
    this.autoresFiltrados = this.autor.filter(
      (a) =>
        (a.Nombre || '').toLowerCase().includes(q) ||
        (a.Nacionalidad || '').toLowerCase().includes(q),
    );
  }
  
  badgeColor(estado: string) {
    switch (estado) {
      case 'COMPLETADA':
        return 'success';
      case 'CANCELADA':
        return 'danger';
      default:
        return 'warning';
    }
  }
}
