import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { PrestamosService } from '../services/prestamos';

@Component({
  selector: 'app-detalle-prestamo',
  templateUrl: './detalle-prestamo.page.html',
  styleUrls: ['./detalle-prestamo.page.scss'],
  standalone: false
})
export class DetallePrestamoPage implements OnInit {
  prestamo: any;
  modalEditandoAbierto = false;
  formActualizarFecha: FormGroup;
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private prestamosService: PrestamosService,
    private fb: FormBuilder,
    private toastCtrl: ToastController
  ) {
    this.formActualizarFecha = this.fb.group({
      FechaDevolucion: [this.getFechaHoy(), [Validators.required]],
    });
  }

  getFechaHoy(): string {
    const fecha = new Date();
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('IdPrestamo');
    if (id) {
      try {
        const data = await this.prestamosService.getPrestamos();
        this.prestamo = data.find((p: any) => p.IdPrestamo.toString() === id);
      } catch (err) {
        console.error(err);
      }
    }
  }

  abrirModalEditar() {
    this.modalEditandoAbierto = true;
    // Pre-llenar con la fecha actual
    this.formActualizarFecha.patchValue({
      FechaDevolucion: this.getFechaHoy(),
    });
  }

  cerrarModalEditar() {
    this.modalEditandoAbierto = false;
  }

  async guardarFechaDevolucion() {
    if (this.formActualizarFecha.invalid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, selecciona una fecha válida.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    this.guardando = true;
    try {
      const fechaDevolucion = this.formActualizarFecha.get('FechaDevolucion')?.value;
      await firstValueFrom(
        this.prestamosService.ActualizarFechaDevolucion(this.prestamo.IdPrestamo, fechaDevolucion)
      );

      const toast = await this.toastCtrl.create({
        message: 'Fecha de devolución actualizada correctamente.',
        color: 'success',
        duration: 2500,
      });
      await toast.present();

      // Actualizar el objeto local
      this.prestamo.FechaDevolucion = fechaDevolucion;
      this.cerrarModalEditar();
    } catch (error) {
      console.error('Error al actualizar fecha de devolución:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo actualizar la fecha de devolución.',
        color: 'danger',
        duration: 3000,
      });
      await toast.present();
    } finally {
      this.guardando = false;
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.formActualizarFecha.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  formatearFecha(valor: any): string {
    if (!valor) return '';

    const fechaTexto = String(valor);
    const soloFecha = fechaTexto.includes('T')
      ? fechaTexto.split('T')[0]
      : fechaTexto;

    const partes = soloFecha.split('-');
    if (partes.length === 3) {
      const [yyyy, mm, dd] = partes;
      if (yyyy && mm && dd) {
        return `${dd}/${mm}/${yyyy}`;
      }
    }

    return fechaTexto;
  }

  tieneUbicacion(): boolean {
    if (!this.prestamo) return false;
    return (
      this.prestamo.Latitud !== null &&
      this.prestamo.Latitud !== undefined &&
      this.prestamo.Longitud !== null &&
      this.prestamo.Longitud !== undefined
    );
  }
}
