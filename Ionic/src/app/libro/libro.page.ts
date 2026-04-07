import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Api } from '../services/autores';
import { LibrosInsert, LibrosService, LibrosUpdate } from '../services/libros';
import { PrestamosService } from '../services/prestamos';

@Component({
  selector: 'app-libro',
  templateUrl: './libro.page.html',
  styleUrls: ['./libro.page.scss'],
  standalone: false,
})
export class LibroPage implements OnInit {
  cargando = true;
  errorMsg = '';
  libro: any[] = [];
  librosFiltrados: any[] = [];
  modalAbierto = false;
  modalEditarAbierto = false;
  guardando = false;
  actualizando = false;
  cargandoAutores = false;
  autores: any[] = [];
  editandoLibro: any | null = null;
  formNuevoLibro: FormGroup;
  formEditarLibro: FormGroup;

  constructor(
    private librosService: LibrosService,
    private autoresService: Api,
    private prestamosService: PrestamosService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) {
    this.formNuevoLibro = this.fb.group({
      Titulo: ['', [Validators.required, Validators.maxLength(200)]],
      AnioPublicacion: [null, [Validators.required, Validators.min(1)]],
      Genero: ['', [Validators.required, Validators.maxLength(100)]],
      IdAutor: [null, [Validators.required]],
      Stock: [0, [Validators.required, Validators.min(0)]],
    });

    this.formEditarLibro = this.fb.group({
      Titulo: ['', [Validators.required, Validators.maxLength(200)]],
      IdAutor: [null, [Validators.required]],
      Stock: [0, [Validators.required, Validators.min(0)]],
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

  private ordenarLibros(lista: any[]): any[] {
    return [...lista].sort((a: any, b: any) =>
      String(a?.Titulo || '').localeCompare(String(b?.Titulo || ''), 'es', {
        sensitivity: 'base',
        ignorePunctuation: true,
      }),
    );
  }

  filtrarLibros(event: any) {
    const valor = this.normalizarTexto(event.target.value || '');
    const filtrados = this.libro.filter((l) =>
      this.normalizarTexto(l?.Titulo || '').includes(valor),
    );
    this.librosFiltrados = this.ordenarLibros(filtrados);
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.librosService.getLibros();
      this.libro = this.ordenarLibros(data || []);
      this.librosFiltrados = [...this.libro];
      this.cargando = false;
      if (event) event.target.complete();
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
    const filtro = this.normalizarTexto(event.detail.value || '');

    if (filtro === '') {
      this.librosFiltrados = [...this.libro];
    } else {
      const esNumero = /^\d+$/.test(filtro);

      const filtrados = this.libro.filter((item: any) => {
        if (esNumero) {
          return item.IdLibro?.toString() === filtro;
        } else {
          return (
            this.normalizarTexto(item.Titulo || '').includes(filtro) ||
            this.normalizarTexto(item.AnioPublicacion || '').includes(filtro) ||
            this.normalizarTexto(item.Genero || '').includes(filtro) ||
            this.normalizarTexto(item.IdAutor || '').includes(filtro)
          );
        }
      });
      this.librosFiltrados = this.ordenarLibros(filtrados);
    }
  }

  async abrirModalCrear() {
    this.modalAbierto = true;
    if (!this.autores.length) {
      await this.cargarAutores();
    }
  }

  async abrirModalEditar(libro: any, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    if (!this.autores.length) {
      await this.cargarAutores();
    }

    let libroDetalle = { ...libro };
    try {
      libroDetalle = await this.librosService.getLibroxID(Number(libro.IdLibro));
    } catch (error) {
      console.error('No se pudo cargar detalle del libro para edición, se usará la lista actual:', error);
    }

    this.editandoLibro = { ...libroDetalle };
    this.modalEditarAbierto = true;

    this.formEditarLibro.reset({
      Titulo: libroDetalle?.Titulo || '',
      IdAutor: libroDetalle?.IdAutor ?? null,
      Stock: Number(libroDetalle?.Stock ?? 0),
    });
  }

  cerrarCrearModal(reiniciar = true) {
    this.modalAbierto = false;
    if (reiniciar) {
      this.formNuevoLibro.reset({
        Titulo: '',
        AnioPublicacion: null,
        Genero: '',
        IdAutor: null,
        Stock: 0,
      });
    }
  }

  async cargarAutores() {
    this.cargandoAutores = true;
    try {
      const resp = await this.autoresService.getAutor();
      this.autores = [...(resp || [])].sort((a: any, b: any) =>
        String(a?.Nombre || '').localeCompare(String(b?.Nombre || ''), 'es', {
          sensitivity: 'base',
          ignorePunctuation: true,
        }),
      );

      if (this.autores.length === 0) {
        const toast = await this.toastCtrl.create({
          message: 'No hay autores disponibles.',
          color: 'warning',
          duration: 2500,
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error al cargar autores:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudieron cargar los autores.',
        color: 'danger',
        duration: 2500,
      });
      await toast.present();
      this.autores = [];
    } finally {
      this.cargandoAutores = false;
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.formNuevoLibro.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  campoEditarInvalido(campo: string): boolean {
    const control = this.formEditarLibro.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cerrarEditarModal(reiniciar = true) {
    this.modalEditarAbierto = false;
    this.editandoLibro = null;
    if (reiniciar) {
      this.formEditarLibro.reset({
        Titulo: '',
        IdAutor: null,
        Stock: 0,
      });
    }
  }

  async guardarNuevoLibro() {
    if (this.formNuevoLibro.invalid) {
      this.formNuevoLibro.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa los campos requeridos.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    const v = this.formNuevoLibro.value;
    const payload: LibrosInsert = {
      Titulo: String(v.Titulo || '').trim(),
      AnioPublicacion: Number(v.AnioPublicacion),
      Genero: String(v.Genero || '').trim(),
      IdAutor: Number(v.IdAutor),
      Stock: Number(v.Stock),
    };

    this.guardando = true;
    try {
      await firstValueFrom(this.librosService.Insertar(payload));
      const toast = await this.toastCtrl.create({
        message: 'Libro creado correctamente.',
        color: 'success',
        duration: 2200,
      });
      await toast.present();
      this.cerrarCrearModal();
      await this.cargar();
    } catch (error) {
      console.error('Error al guardar libro:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo guardar el libro.',
        color: 'danger',
        duration: 3000,
      });
      await toast.present();
    } finally {
      this.guardando = false;
    }
  }

  agregarLibro() {
    this.abrirModalCrear();
  }

  private async mostrarAlertaSimple(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atención',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async guardarEdicionLibro() {
    if (this.formEditarLibro.invalid || !this.editandoLibro?.IdLibro) {
      this.formEditarLibro.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa los campos requeridos.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    const v = this.formEditarLibro.value;
    const payload: LibrosUpdate = {
      Titulo: String(v.Titulo || '').trim(),
      IdAutor: Number(v.IdAutor),
      Stock: Number(v.Stock),
      AnioPublicacion: this.editandoLibro?.AnioPublicacion,
      Genero: this.editandoLibro?.Genero,
    };

    this.actualizando = true;
    try {
      await firstValueFrom(this.librosService.Actualizar(Number(this.editandoLibro.IdLibro), payload));
      const toast = await this.toastCtrl.create({
        message: 'Libro actualizado correctamente.',
        color: 'success',
        duration: 2200,
      });
      await toast.present();
      this.cerrarEditarModal();
      await this.cargar();
    } catch (error) {
      console.error('Error al actualizar libro:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo actualizar el libro.',
        color: 'danger',
        duration: 3000,
      });
      await toast.present();
    } finally {
      this.actualizando = false;
    }
  }

  async eliminarLibro(libro: any, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    try {
      const prestamos = await this.prestamosService.getPrestamos();
      const tienePendientes = (prestamos || []).some(
        (p: any) =>
          Number(p.IdLibro) === Number(libro.IdLibro) &&
          (p.FechaDevolucion === null || p.FechaDevolucion === undefined),
      );
      const tieneHistorial = (prestamos || []).some(
        (p: any) => Number(p.IdLibro) === Number(libro.IdLibro),
      );

      if (tienePendientes) {
        await this.mostrarAlertaSimple('El libro tiene préstamos pendientes');
        return;
      }

      if (tieneHistorial) {
        await this.mostrarAlertaSimple('No se puede eliminar el libro porque tiene historial de préstamos.');
        return;
      }
    } catch (error) {
      console.error('Error validando prestamos del libro:', error);
      await this.mostrarAlertaSimple('No se pudo validar si el libro tiene préstamos activos o historial.');
      return;
    }

    const confirm = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que deseas eliminar este libro?',
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
              await firstValueFrom(this.librosService.Eliminar(Number(libro.IdLibro)));
              const toast = await this.toastCtrl.create({
                message: 'Libro eliminado correctamente.',
                color: 'success',
                duration: 2200,
              });
              await toast.present();
              await this.cargar();
            } catch (error: any) {
              console.error('Error al eliminar libro:', error);

              const mensaje = String(error?.message || '').trim();
              if (mensaje.toLowerCase().includes('prestamos pendientes') || mensaje.toLowerCase().includes('préstamos pendientes')) {
                const toastPendiente = await this.toastCtrl.create({
                  message: 'No se pudo eliminar porque el libro está en préstamo (tiene préstamos pendientes).',
                  color: 'warning',
                  duration: 3200,
                });
                await toastPendiente.present();
                return;
              }

              if (mensaje.toLowerCase().includes('historial de préstamos') || mensaje.toLowerCase().includes('historial de prestamos')) {
                const toastHistorial = await this.toastCtrl.create({
                  message: 'No se puede eliminar el libro porque tiene historial de préstamos.',
                  color: 'warning',
                  duration: 3200,
                });
                await toastHistorial.present();
                return;
              }

              const toast = await this.toastCtrl.create({
                message: mensaje || 'No se pudo eliminar el libro.',
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
