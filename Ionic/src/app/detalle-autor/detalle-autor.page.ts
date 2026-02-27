import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-detalle-autor',
  templateUrl: './detalle-autor.page.html',
  styleUrls: ['./detalle-autor.page.scss'],
  standalone: false
})
export class DetalleAutorPage implements OnInit {
  autor: any;

  constructor(private route: ActivatedRoute, private api: Api) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('IdAutor');
    if (id) {
      this.api.getAutor().subscribe(data => {
        this.autor = data.find(a => a.IdAutor.toString() === id);
      });
    }
  }
}
