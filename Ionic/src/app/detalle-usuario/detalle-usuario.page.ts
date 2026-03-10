import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../services/usuarios';

@Component({
  selector: 'app-detalle-usuario',
  templateUrl: './detalle-usuario.page.html',
  styleUrls: ['./detalle-usuario.page.scss'],
  standalone: false
})
export class DetalleUsuarioPage implements OnInit {
  usuario: any;

  constructor(private route: ActivatedRoute, private usuariosService: UsuariosService) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('IdUsuario');
    if (id) {
      try {
        const data = await this.usuariosService.getUsuarios();
        this.usuario = data.find((u: any) => u.IdUsuario.toString() === id);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

