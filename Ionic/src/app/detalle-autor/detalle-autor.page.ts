import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../services/autores';

@Component({
  selector: 'app-detalle-autor',
  templateUrl: './detalle-autor.page.html',
  styleUrls: ['./detalle-autor.page.scss'],
  standalone: false,
})
export class DetalleAutorPage implements OnInit {
  autor: any;

  constructor(private route: ActivatedRoute, private api: Api) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('IdAutor');
    if (id) {
      try {
        const data = await this.api.getAutor();
        if (Array.isArray(data)) {
          this.autor = data.find((a: any) => a.IdAutor.toString() === id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
}
