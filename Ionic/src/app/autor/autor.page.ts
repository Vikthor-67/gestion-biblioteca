import { Component, OnInit } from '@angular/core';
import { Api } from '../services/api';

@Component({
  selector: 'app-autor',
  templateUrl: './autor.page.html',
  styleUrls: ['./autor.page.scss'],
  standalone: false,
})
export class AutorPage implements OnInit {
  cargando = false;
  errorMsg = '';
  autor: any[] = [];
  autoresFiltrados: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.cargar();
    this.api.getAutor().subscribe(data => {  
    this.autor = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre)); 
    this.autoresFiltrados = [...this.autor]; });
  }

filtrarAutores(event: any) {
    const valor = event.target.value.toLowerCase();
    const quitarAcentos = (texto: string) =>
      texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    this.autoresFiltrados = this.autor.filter((a) =>
      quitarAcentos(a.Nombre.toLowerCase()).includes(quitarAcentos(valor)),
    );
  }

  cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    this.api.getAutor().subscribe({
      next: (data) => {
        this.autor = data || [];
        this.autoresFiltrados = [...this.autor];
        this.cargando = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.errorMsg = 'Error al cargar, verifique la API';
        this.cargando = false;
        if (event) event.target.complete();
        console.error(err);
      }
    });
  }

  buscar(event: any) {
    const filtro = event.detail.value?.toLowerCase() || '';
    const esNumero = /^\d+$/.test(filtro);

    this.autoresFiltrados = this.autor.filter((item) => {
      if (esNumero) {
        return item.IdAutor?.toString() === filtro;
      } else {
        return item.Nombre?.toLowerCase().includes(filtro) ||
               item.Nacionalidad?.toLowerCase().includes(filtro);
      }
    });
  }
}
