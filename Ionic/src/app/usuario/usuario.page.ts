import { Component, OnInit } from '@angular/core';
import { Api } from '../services/api';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: false,
})
export class UsuarioPage implements OnInit {
  cargando = true;
  errorMsg = '';
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.cargar();
  }

  filtrarUsuarios(event: any) {
    const q = (event.target.value || '').toLowerCase().trim();
    if (!q) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }
    this.usuariosFiltrados = this.usuarios.filter(
      (u) => (u.Nombre || '').toLowerCase().includes(q),
    );
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.api.getUsuarios();
      this.usuarios = data || [];
      this.usuariosFiltrados = [...this.usuarios];
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

