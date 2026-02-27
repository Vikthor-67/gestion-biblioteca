import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class UsuarioPage implements OnInit {
  cargando: boolean = false;
  errorMsg: string = '';
  usuario: any[] = [];
  usuariosFiltrados: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.cargar();
    this.api.getUsuarios().subscribe((data) => {
      this.usuario = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      this.usuariosFiltrados = [...this.usuario];
    });
  }

  filtrarUsuarios(event: any) {
    const valor = event.target.value.toLowerCase();
    const quitarAcentos = (texto: string) =>
      texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    this.usuariosFiltrados = this.usuario.filter((u) =>
      quitarAcentos(u.Nombre.toLowerCase()).includes(quitarAcentos(valor)),
    );
  }

  cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    this.api.getUsuarios().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.usuario = data || [];
        this.usuariosFiltrados = [...this.usuario];
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
      this.usuariosFiltrados = [...this.usuario];
    } else {
      const esNumero = /^\d+$/.test(filtro);

      this.usuariosFiltrados = this.usuario.filter((item) => {
        if (esNumero) {
          return item.IdUsuario?.toString() === filtro;
        } else {
          return (
            item.Nombre?.toLowerCase().includes(filtro) ||
            item.Email?.toLowerCase().includes(filtro) ||
            item.Telefono?.toLowerCase().includes(filtro)
          );
        }
      });
    }
  }
}
