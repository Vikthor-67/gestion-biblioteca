import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-detalle-libro',
  templateUrl: './detalle-libro.page.html',
  styleUrls: ['./detalle-libro.page.scss'],
  standalone: false
})
export class DetalleLibroPage implements OnInit {
  libro: any;

  constructor(private route: ActivatedRoute, private api: Api) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('IdLibro');
    if (id) {
      this.api.getLibros().subscribe(data => {
        this.libro = data.find(l => l.IdLibro.toString() === id);
      });
    }
  }
}

