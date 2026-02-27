import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleAutorPage } from './detalle-autor.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleAutorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleAutorPageRoutingModule {}
