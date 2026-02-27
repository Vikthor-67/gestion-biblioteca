import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallePrestamoPageRoutingModule } from './detalle-prestamo-routing.module';

import { DetallePrestamoPage } from './detalle-prestamo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallePrestamoPageRoutingModule
  ],
  declarations: [DetallePrestamoPage]
})
export class DetallePrestamoPageModule {}
