import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Api } from '../services/autores';
import { LibrosInsert, LibrosService } from '../services/libros';

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
  guardando = false;
  cargandoAutores = false;
  autores: any[] = [];
  formNuevoLibro: FormGroup;

  constructor(
    private librosService: LibrosService,
    private autoresService: Api,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
  ) {
    this.formNuevoLibro = this.fb.group({
      Titulo: ['', [Validators.required, Validators.maxLength(200)]],
      AnioPublicacion: [null, [Validators.required, Validators.min(1)]],
      Genero: ['', [Validators.required, Validators.maxLength(100)]],
      IdAutor: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.cargar();
  }

  filtrarLibros(event: any) {
    const valor = event.target.value.toLowerCase();
    const quitarAcentos = (texto: string) =>
      texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    this.librosFiltrados = this.libro.filter((l) =>
      quitarAcentos(l.Titulo.toLowerCase()).includes(quitarAcentos(valor)),
    );
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.librosService.getLibros();
      this.libro = data.sort((a: any, b: any) => a.Titulo.localeCompare(b.Titulo)) || [];
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
    const filtro = event.detail.value?.toLowerCase() || '';

    if (filtro === '') {
      this.librosFiltrados = [...this.libro];
    } else {
      const esNumero = /^\d+$/.test(filtro);

      this.librosFiltrados = this.libro.filter((item: any) => {
        if (esNumero) {
          return item.IdLibro?.toString() === filtro;
        } else {
          return (
            item.Titulo?.toLowerCase().includes(filtro) ||
            item.AnioPublicacion?.toLowerCase().includes(filtro) ||
            item.Genero?.toLowerCase().includes(filtro) ||
            item.IdAutor?.toLowerCase().includes(filtro)
          );
        }
      });
    }
  }

  async abrirModalCrear() {
    this.modalAbierto = true;
    if (!this.autores.length) {
      await this.cargarAutores();
    }
  }

  cerrarCrearModal(reiniciar = true) {
    this.modalAbierto = false;
    if (reiniciar) {
      this.formNuevoLibro.reset({
        Titulo: '',
        AnioPublicacion: null,
        Genero: '',
        IdAutor: null,
      });
    }
  }

  async cargarAutores() {
    this.cargandoAutores = true;
    try {
      const resp = await this.autoresService.getAutor();
      this.autores = resp || [];

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
}
