import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { UsuariosInsert, UsuariosService } from '../services/usuarios';

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
  guardando = false;
  formNuevoUsuario: FormGroup;

  constructor(
    private usuariosService: UsuariosService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
  ) {
    this.formNuevoUsuario = this.fb.group({
      Nombre: ['', [Validators.required, Validators.maxLength(150)]],
      Email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      Telefono: ['', [Validators.required, Validators.maxLength(30)]],
    });
  }

  ngOnInit() {
    this.cargar();
  }

  filtrarUsuarios(event: any) {
    const q = (event.target.value || '').toLowerCase().trim();
    if (!q) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }
    this.usuariosFiltrados = this.usuarios.filter(
      (u) => (u.Nombre || '').toLowerCase().includes(q),
    );
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.usuariosService.getUsuarios();
      this.usuarios = data || [];
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
      Telefono: String(v.Telefono).trim(),
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
}

