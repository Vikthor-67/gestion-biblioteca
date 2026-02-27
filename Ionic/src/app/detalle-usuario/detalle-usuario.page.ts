import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-detalle-usuario',
  templateUrl: './detalle-usuario.page.html',
  styleUrls: ['./detalle-usuario.page.scss'],
  standalone: false
})
export class DetalleUsuarioPage implements OnInit {
  usuario: any;

  constructor(private route: ActivatedRoute, private api: Api) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('IdUsuario');
    if (id) {
      this.api.getUsuarios().subscribe(data => {
        this.usuario = data.find(u => u.IdUsuario.toString() === id);
      });
    }
  }
}

