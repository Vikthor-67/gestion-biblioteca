import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AutorPageRoutingModule } from './autor-routing.module';

import { AutorPage } from './autor.page';

export interface AutorListaItem {
  IdAutor: number;
  Nombre: string;
  Nacionalidad: string;
}

export interface AutorDetalle extends AutorListaItem {
  //agregar campos adicionales si es necesario
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AutorPageRoutingModule
  ],
  declarations: [AutorPage]
})
export class AutorPageModule {}
