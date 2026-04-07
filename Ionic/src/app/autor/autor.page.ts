import { Component, OnInit } from '@angular/core';
import { Api, AutoresInsert, AutoresUpdate } from '../services/autores';
import { AutorListaItem } from './autor.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { LibrosService } from '../services/libros';

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
  modalEditarAbierto = false;
  guardando = false;
  actualizando = false;
  editandoAutorId: number | null = null;
  formNuevoAutor: FormGroup;
  formEditarAutor: FormGroup;

  constructor(
    private api: Api,
    private librosService: LibrosService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) {
    this.formNuevoAutor = this.fb.group({
      Nombre: ['', [Validators.required, Validators.maxLength(150)]],
      Nacionalidad: ['', [Validators.required, Validators.maxLength(100)]],
    });

    this.formEditarAutor = this.fb.group({
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

  abrirModalEditar(autor: AutorListaItem, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    this.editandoAutorId = autor.IdAutor;
    this.formEditarAutor.reset({
      Nombre: autor.Nombre || '',
      Nacionalidad: autor.Nacionalidad || '',
    });
    this.modalEditarAbierto = true;
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

  campoEditarInvalido(campo: string): boolean {
    const control = this.formEditarAutor.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cerrarEditarModal(reiniciar = true) {
    this.modalEditarAbierto = false;
    this.editandoAutorId = null;
    if (reiniciar) {
      this.formEditarAutor.reset({
        Nombre: '',
        Nacionalidad: '',
      });
    }
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

  async guardarEdicionAutor() {
    if (this.formEditarAutor.invalid || this.editandoAutorId === null) {
      this.formEditarAutor.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa los campos requeridos.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    const v = this.formEditarAutor.value;
    const payload: AutoresUpdate = {
      Nombre: String(v.Nombre || '').trim(),
      Nacionalidad: String(v.Nacionalidad || '').trim(),
    };

    this.actualizando = true;
    try {
      await firstValueFrom(this.api.Actualizar(this.editandoAutorId, payload));
      const toast = await this.toastCtrl.create({
        message: 'Autor actualizado correctamente.',
        color: 'success',
        duration: 2200,
      });
      await toast.present();
      this.cerrarEditarModal();
      await this.cargar();
    } catch (error) {
      console.error('Error al actualizar autor:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo actualizar el autor.',
        color: 'danger',
        duration: 3000,
      });
      await toast.present();
    } finally {
      this.actualizando = false;
    }
  }

  private async mostrarAlertaSimple(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async eliminarAutor(autor: AutorListaItem, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    try {
      const libros = await this.librosService.getLibros();
      const tieneLibros = (libros || []).some(
        (libro: any) => Number(libro.IdAutor) === Number(autor.IdAutor),
      );

      if (tieneLibros) {
        await this.mostrarAlertaSimple('No se puede eliminar, tiene libros asociados');
        return;
      }
    } catch (error) {
      console.error('Error validando libros asociados del autor:', error);
      await this.mostrarAlertaSimple('No se pudo validar si el autor tiene libros asociados.');
      return;
    }

    const confirm = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que deseas eliminar este autor?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await firstValueFrom(this.api.Eliminar(autor.IdAutor));
              const toast = await this.toastCtrl.create({
                message: 'Autor eliminado correctamente.',
                color: 'success',
                duration: 2200,
              });
              await toast.present();
              await this.cargar();
            } catch (error) {
              console.error('Error al eliminar autor:', error);
              const backendMessage = String(
                (error as any)?.error?.message ||
                (error as any)?.message ||
                '',
              ).toLowerCase();
              const esBloqueoPorLibros =
                backendMessage.includes('libro') ||
                backendMessage.includes('asociad') ||
                backendMessage.includes('ligad');

              const toast = await this.toastCtrl.create({
                message: esBloqueoPorLibros
                  ? 'No se puede eliminar el autor porque tiene un libro ligado.'
                  : 'No se pudo eliminar el autor.',
                color: 'danger',
                duration: 3000,
              });
              await toast.present();
            }
          },
        },
      ],
    });
    await confirm.present();
  }
}
