import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrestamoPageRoutingModule } from './prestamo-routing.module';

import { PrestamoPage } from './prestamo.page';

@NgModule({
  declarations: [PrestamoPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PrestamoPageRoutingModule,
  ],
})
export class PrestamoPageModule {}
