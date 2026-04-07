import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { UsuariosInsert, UsuariosService, UsuariosUpdate } from '../services/usuarios';
import { PrestamosService } from '../services/prestamos';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: false,
})
export class UsuarioPage implements OnInit {
  cargando = true;
  errorMsg = '';
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  modalAbierto = false;
  modalEditarAbierto = false;
  guardando = false;
  actualizando = false;
  editandoUsuario: any | null = null;
  formNuevoUsuario: FormGroup;
  formEditarUsuario: FormGroup;

  constructor(
    private usuariosService: UsuariosService,
    private prestamosService: PrestamosService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) {
    this.formNuevoUsuario = this.fb.group({
      Nombre: ['', [Validators.required, Validators.maxLength(150)]],
      Email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      Telefono: [
        '',
        [
          Validators.required,
          Validators.maxLength(9),
          Validators.pattern(/^\d{4}-\d{4}$/),
        ],
      ],
    });

    this.formEditarUsuario = this.fb.group({
      Nombre: ['', [Validators.required, Validators.maxLength(150)]],
      Email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      Telefono: [
        '',
        [
          Validators.required,
          Validators.maxLength(9),
          Validators.pattern(/^\d{4}-\d{4}$/),
        ],
      ],
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

  private ordenarUsuarios(lista: any[]): any[] {
    return [...lista].sort((a: any, b: any) =>
      String(a?.Nombre || '').localeCompare(String(b?.Nombre || ''), 'es', {
        sensitivity: 'base',
        ignorePunctuation: true,
      }),
    );
  }

  filtrarUsuarios(event: any) {
    const q = this.normalizarTexto(event.target.value || '');
    if (!q) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }
    const filtrados = this.usuarios.filter((u) =>
      this.normalizarTexto(u.Nombre || '').includes(q),
    );
    this.usuariosFiltrados = this.ordenarUsuarios(filtrados);
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.usuariosService.getUsuarios();
      this.usuarios = this.ordenarUsuarios(data || []);
      this.usuariosFiltrados = [...this.usuarios];
    } catch (e: any) {
      console.log('ERROR NATIVO:', e);
      this.errorMsg = 'No se pudo cargar la información (nativo).';
      alert(JSON.stringify(e, null, 2));
    } finally {
      this.cargando = false;
      if (event) event.target.complete();
    }
  }

  abrirModalCrear() {
    this.modalAbierto = true;
  }

  abrirModalEditar(usuario: any, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    this.editandoUsuario = { ...usuario };
    const telefonoSinPrefijo = String(usuario?.Telefono || '').replace(/^\+504\s*/, '');

    this.formEditarUsuario.reset({
      Nombre: usuario?.Nombre || '',
      Email: usuario?.Email || '',
      Telefono: telefonoSinPrefijo,
    });
    this.modalEditarAbierto = true;
  }

  cerrarCrearModal(reiniciar = true) {
    this.modalAbierto = false;
    if (reiniciar) {
      this.formNuevoUsuario.reset({
        Nombre: '',
        Email: '',
        Telefono: '',
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.formNuevoUsuario.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  campoEditarInvalido(campo: string): boolean {
    const control = this.formEditarUsuario.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  cerrarEditarModal(reiniciar = true) {
    this.modalEditarAbierto = false;
    this.editandoUsuario = null;
    if (reiniciar) {
      this.formEditarUsuario.reset({
        Nombre: '',
        Email: '',
        Telefono: '',
      });
    }
  }

  formatearTelefono(event: any) {
    const raw = String(event?.detail?.value ?? event?.target?.value ?? '');
    const soloDigitos = raw.replace(/\D/g, '').slice(0, 8);
    const formateado =
      soloDigitos.length > 4
        ? `${soloDigitos.slice(0, 4)}-${soloDigitos.slice(4)}`
        : soloDigitos;

    const telefonoControl = this.formNuevoUsuario.get('Telefono');
    if (telefonoControl && telefonoControl.value !== formateado) {
      telefonoControl.setValue(formateado, { emitEvent: false });
    }
  }

  formatearTelefonoEdicion(event: any) {
    const raw = String(event?.detail?.value ?? event?.target?.value ?? '');
    const soloDigitos = raw.replace(/\D/g, '').slice(0, 8);
    const formateado =
      soloDigitos.length > 4
        ? `${soloDigitos.slice(0, 4)}-${soloDigitos.slice(4)}`
        : soloDigitos;

    const telefonoControl = this.formEditarUsuario.get('Telefono');
    if (telefonoControl && telefonoControl.value !== formateado) {
      telefonoControl.setValue(formateado, { emitEvent: false });
    }
  }

  async guardarNuevoUsuario() {
    if (this.formNuevoUsuario.invalid) {
      this.formNuevoUsuario.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa los campos requeridos.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    const v = this.formNuevoUsuario.value;
    const payload: UsuariosInsert = {
      Nombre: String(v.Nombre).trim(),
      Email: String(v.Email).trim(),
      Telefono: `+504 ${String(v.Telefono).trim()}`,
    };

    this.guardando = true;
    try {
      await firstValueFrom(this.usuariosService.Insertar(payload));
      const toast = await this.toastCtrl.create({
        message: 'Usuario creado correctamente.',
        color: 'success',
        duration: 2200,
      });
      await toast.present();
      this.cerrarCrearModal();
      await this.cargar();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo guardar el usuario.',
        color: 'danger',
        duration: 3000,
      });
      await toast.present();
    } finally {
      this.guardando = false;
    }
  }

  agregarUsuario() {
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

  async guardarEdicionUsuario() {
    if (this.formEditarUsuario.invalid || !this.editandoUsuario?.IdUsuario) {
      this.formEditarUsuario.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa los campos requeridos.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    const v = this.formEditarUsuario.value;
    const payload: UsuariosUpdate = {
      Nombre: String(v.Nombre).trim(),
      Email: String(v.Email).trim(),
      Telefono: `+504 ${String(v.Telefono).trim()}`,
    };

    this.actualizando = true;
    try {
      await firstValueFrom(this.usuariosService.Actualizar(Number(this.editandoUsuario.IdUsuario), payload));
      const toast = await this.toastCtrl.create({
        message: 'Usuario actualizado correctamente.',
        color: 'success',
        duration: 2200,
      });
      await toast.present();
      this.cerrarEditarModal();
      await this.cargar();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo actualizar el usuario.',
        color: 'danger',
        duration: 3000,
      });
      await toast.present();
    } finally {
      this.actualizando = false;
    }
  }

  async eliminarUsuario(usuario: any, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    try {
      const prestamos = await this.prestamosService.getPrestamos();
      const tienePendientes = (prestamos || []).some(
        (p: any) =>
          Number(p.IdUsuario) === Number(usuario.IdUsuario) &&
          (p.FechaDevolucion === null || p.FechaDevolucion === undefined),
      );

      if (tienePendientes) {
        await this.mostrarAlertaSimple('El usuario tiene préstamos pendientes');
        return;
      }
    } catch (error) {
      console.error('Error validando prestamos del usuario:', error);
      await this.mostrarAlertaSimple('No se pudo validar si el usuario tiene préstamos pendientes.');
      return;
    }

    const confirm = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Seguro que deseas eliminar este usuario?',
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
              await firstValueFrom(this.usuariosService.Eliminar(Number(usuario.IdUsuario)));
              const toast = await this.toastCtrl.create({
                message: 'Usuario eliminado correctamente.',
                color: 'success',
                duration: 2200,
              });
              await toast.present();
              await this.cargar();
            } catch (error: any) {
              console.error('Error al eliminar usuario:', error);

              const mensaje = String(error?.message || '').trim();
              if (mensaje.toLowerCase().includes('prestamos pendientes') || mensaje.toLowerCase().includes('préstamos pendientes')) {
                await this.mostrarAlertaSimple('El usuario tiene préstamos pendientes');
                return;
              }

              const toast = await this.toastCtrl.create({
                message: mensaje || 'No se pudo eliminar el usuario.',
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

