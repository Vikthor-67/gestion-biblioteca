import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-detalle-prestamo',
  templateUrl: './detalle-prestamo.page.html',
  styleUrls: ['./detalle-prestamo.page.scss'],
  standalone: false
})
export class DetallePrestamoPage implements OnInit {
  prestamo: any;   

  constructor(private route: ActivatedRoute, private api: Api) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('IdPrestamo');
    if (id) {
      try {
        const data = await this.api.getPrestamos();
        this.prestamo = data.find((p: any) => p.IdPrestamo.toString() === id);
      } catch (err) {
        console.error(err);
      }
    }
  }
}
