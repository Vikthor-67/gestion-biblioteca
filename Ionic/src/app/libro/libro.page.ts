import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-libro',
  templateUrl: './libro.page.html',
  styleUrls: ['./libro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class LibroPage implements OnInit {
  cargando: boolean = false;
  errorMsg: string = '';
  libro: any[] = [];
  librosFiltrados: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.cargar();
    this.api.getLibros().subscribe((data) => {
      this.libro = data.sort((a, b) => a.Titulo.localeCompare(b.Titulo));
      this.librosFiltrados = [...this.libro];
    });
  }

  filtrarLibros(event: any) {
    const valor = event.target.value.toLowerCase();
    const quitarAcentos = (texto: string) =>
      texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    this.librosFiltrados = this.libro.filter((l) =>
      quitarAcentos(l.Titulo.toLowerCase()).includes(quitarAcentos(valor)),
    );
  }

  cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    this.api.getLibros().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.libro = data || [];
        this.librosFiltrados = [...this.libro];
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
      this.librosFiltrados = [...this.libro];
    } else {
      const esNumero = /^\d+$/.test(filtro);

      this.librosFiltrados = this.libro.filter((item) => {
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
