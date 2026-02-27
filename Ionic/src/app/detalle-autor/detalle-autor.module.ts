import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleAutorPageRoutingModule } from './detalle-autor-routing.module';

import { DetalleAutorPage } from './detalle-autor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleAutorPageRoutingModule
  ],
  declarations: [DetalleAutorPage]
})
export class DetalleAutorPageModule {}
