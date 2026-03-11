import { Component, OnInit } from '@angular/core';
import { Api, AutoresInsert } from '../services/autores';
import { AutorListaItem } from './autor.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-autor',
  templateUrl: './autor.page.html',
  styleUrls: ['./autor.page.scss'],
  standalone: false,
})
export class AutorPage implements OnInit {
  cargando = true;
  errorMsg = '';
  autor: AutorListaItem[] = [];
  autoresFiltrados: AutorListaItem[] = [];
  modalAbierto = false;
  guardando = false;
  formNuevoAutor: FormGroup;

  constructor(
    private api: Api,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
  ) {
    this.formNuevoAutor = this.fb.group({
      Nombre: ['', [Validators.required, Validators.maxLength(150)]],
      Nacionalidad: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit() {
    this.cargar();
  }

  private normalizarTexto(texto: string): string {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private ordenarAutores(lista: AutorListaItem[]): AutorListaItem[] {
    return [...lista].sort((a, b) =>
      String(a?.Nombre || '').localeCompare(String(b?.Nombre || ''), 'es', {
        sensitivity: 'base',
        ignorePunctuation: true,
      }),
    );
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.api.getAutor();
      this.autor = this.ordenarAutores(data || []);
      this.autoresFiltrados = [...this.autor];
    } catch (e: any) {
      console.log('ERROR NATIVO:', e);
      this.errorMsg = 'No se pudo cargar la información (nativo).';
      alert(JSON.stringify(e, null, 2));
    } finally {
      this.cargando = false;
      if (event) event.target.complete();
    }
  }

  buscar(event: any) {
    const q = this.normalizarTexto(event.target.value || '');
    if (!q) {
      this.autoresFiltrados = [...this.autor];
      return;
    }
    const filtrados = this.autor.filter(
      (a) =>
        this.normalizarTexto(a.Nombre || '').includes(q) ||
        this.normalizarTexto(a.Nacionalidad || '').includes(q),
    );
    this.autoresFiltrados = this.ordenarAutores(filtrados);
  }
  
  badgeColor(estado: string) {
    switch (estado) {
      case 'COMPLETADA':
        return 'success';
      case 'CANCELADA':
        return 'danger';
      default:
        return 'warning';
    }
  }

  async abrirModalCrear() {
    this.modalAbierto = true;
  }

  cerrarCrearModal(reiniciar = true) {
    this.modalAbierto = false;
    if (reiniciar) {
      this.formNuevoAutor.reset({
        Nombre: '',
        Nacionalidad: '',
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.formNuevoAutor.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async guardarNuevoAutor() {
    if (this.formNuevoAutor.invalid) {
      this.formNuevoAutor.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa los campos requeridos.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    const v = this.formNuevoAutor.value;
    const payload: AutoresInsert = {
      Nombre: String(v.Nombre || '').trim(),
      Nacionalidad: String(v.Nacionalidad || '').trim(),
    };

    this.guardando = true;
    try {
      await firstValueFrom(this.api.Insertar(payload));
      const toast = await this.toastCtrl.create({
        message: 'Autor creado correctamente.',
        color: 'success',
        duration: 2200,
      });
      await toast.present();
      this.cerrarCrearModal();
      await this.cargar();
    } catch (error) {
      console.error('Error al guardar autor:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo guardar el autor.',
        color: 'danger',
        duration: 3000,
      });
      await toast.present();
    } finally {
      this.guardando = false;
    }
  }

  agregarAutor() {
    this.abrirModalCrear();
  }
}
