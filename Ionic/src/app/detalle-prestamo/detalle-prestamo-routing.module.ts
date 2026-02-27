import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallePrestamoPage } from './detalle-prestamo.page';

const routes: Routes = [
  {
    path: '',
    component: DetallePrestamoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallePrestamoPageRoutingModule {}
