import { Component, OnInit } from '@angular/core';
import { Api } from '../services/api';

@Component({
  selector: 'app-libro',
  templateUrl: './libro.page.html',
  styleUrls: ['./libro.page.scss'],
  standalone: false,
})
export class LibroPage implements OnInit {
  cargando = true;
  errorMsg = '';
  libro: any[] = [];
  librosFiltrados: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.cargar();
  }

  filtrarLibros(event: any) {
    const valor = event.target.value.toLowerCase();
    const quitarAcentos = (texto: string) =>
      texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    this.librosFiltrados = this.libro.filter((l) =>
      quitarAcentos(l.Titulo.toLowerCase()).includes(quitarAcentos(valor)),
    );
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.api.getLibros();
      this.libro = data.sort((a: any, b: any) => a.Titulo.localeCompare(b.Titulo)) || [];
      this.librosFiltrados = [...this.libro];
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

  buscar(event: any) {
    const filtro = event.detail.value?.toLowerCase() || '';

    if (filtro === '') {
      this.librosFiltrados = [...this.libro];
    } else {
      const esNumero = /^\d+$/.test(filtro);

      this.librosFiltrados = this.libro.filter((item: any) => {
        if (esNumero) {
          return item.IdLibro?.toString() === filtro;
        } else {
          return (
            item.Titulo?.toLowerCase().includes(filtro) ||
            item.AnioPublicacion?.toLowerCase().includes(filtro) ||
            item.Genero?.toLowerCase().includes(filtro) ||
            item.IdAutor?.toLowerCase().includes(filtro)
          );
        }
      });
    }
  }
}
