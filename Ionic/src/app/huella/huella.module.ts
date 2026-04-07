import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HuellaPageRoutingModule } from './huella-routing.module';

import { HuellaPage } from './huella.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    HuellaPageRoutingModule
  ],
  declarations: [HuellaPage]
})
export class HuellaPageModule { }
