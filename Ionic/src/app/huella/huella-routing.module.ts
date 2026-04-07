import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HuellaPage } from './huella.page';

const routes: Routes = [
  {
    path: '',
    component: HuellaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HuellaPageRoutingModule {}
