import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrestamosInsert, PrestamosService } from '../services/prestamos';
import { Api } from '../services/autores';
import { LibrosService } from '../services/libros';
import { UsuariosService } from '../services/usuarios';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-prestamo',
  templateUrl: './prestamo.page.html',
  styleUrls: ['./prestamo.page.scss'],
  standalone: false,
})
export class PrestamoPage implements OnInit, OnDestroy {
  cargando = true;
  errorMsg = '';
  prestamo: any[] = [];
  prestamosFiltrados: any[] = [];
  soloActivos = false;
  modalAbierto = false;
  guardando = false;
  cargandoAutores = false;
  cargandoLibros = false;
  cargandoUsuarios = false;
    cargandoUbicacion = false;
  autores: any[] = [];
  librosOriginal: any[] = [];
  libros: any[] = [];
  usuarios: any[] = [];
  private destroy$ = new Subject<void>();
  private autorSubscription: Subscription | null = null;
  private autoRefreshHandle: any = null;
  private readonly intervaloAutoRefreshMs = 5000;
  formNuevoPrestamo: FormGroup;

  constructor(
    private prestamosService: PrestamosService,
    private autoresService: Api,
    private librosService: LibrosService,
    private usuariosService: UsuariosService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
  ) {
    this.formNuevoPrestamo = this.fb.group({
      FechaPrestamo: [this.getFechaHoy(), [Validators.required]],
      IdAutor: [null, [Validators.required]],
      IdLibro: [null, [Validators.required]],
      IdUsuario: [null, [Validators.required]],
      Latitud: [null],
      Longitud: [null],
    });
  }

  getFechaHoy(): string {
    const fecha = new Date();
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.soloActivos = params['activos'] === 'true';
      this.cargar();
      this.configurarAutoRefreshActivos();
    });
  }

  ionViewWillEnter() {
    this.configurarAutoRefreshActivos();
  }

  ionViewDidLeave() {
    this.detenerAutoRefreshActivos();
  }

  ngOnDestroy() {
    this.detenerAutoRefreshActivos();
    this.destroy$.next();
    this.destroy$.complete();
    if (this.autorSubscription) {
      this.autorSubscription.unsubscribe();
    }
  }

  private configurarAutoRefreshActivos() {
    this.detenerAutoRefreshActivos();

    if (!this.soloActivos) {
      return;
    }

    this.autoRefreshHandle = setInterval(() => {
      this.cargar();
    }, this.intervaloAutoRefreshMs);
  }

  private detenerAutoRefreshActivos() {
    if (this.autoRefreshHandle) {
      clearInterval(this.autoRefreshHandle);
      this.autoRefreshHandle = null;
    }
  }

  private ordenarPrestamos(lista: any[]): any[] {
    return [...lista].sort((a: any, b: any) => {
      const cmpLibro = String(a?.Libro || '').localeCompare(
        String(b?.Libro || ''),
        'es',
        { sensitivity: 'base', ignorePunctuation: true },
      );
      if (cmpLibro !== 0) return cmpLibro;

      const cmpUsuario = String(a?.Usuario || '').localeCompare(
        String(b?.Usuario || ''),
        'es',
        { sensitivity: 'base', ignorePunctuation: true },
      );
      if (cmpUsuario !== 0) return cmpUsuario;

      return Number(a?.IdPrestamo || 0) - Number(b?.IdPrestamo || 0);
    });
  }

  filtrarPrestamos(event: any) {
    const valor = String(event.target.value || '').toLowerCase();
    const filtrados = this.prestamo.filter((p) => {
      const libro = String(p?.Libro || '').toLowerCase();
      const usuario = String(p?.Usuario || '').toLowerCase();
      return libro.includes(valor) || usuario.includes(valor);
    });
    this.prestamosFiltrados = this.ordenarPrestamos(filtrados);
  }

  async cargar(event?: any) {
    this.cargando = true;
    this.errorMsg = '';

    try {
      const data = await this.prestamosService.getPrestamos();
      let prestamos = data || [];

      if (this.soloActivos) {
        prestamos = prestamos.filter((p: any) => !p.FechaDevolucion);
      }

      this.prestamo = this.ordenarPrestamos(prestamos);
      this.prestamosFiltrados = [...this.prestamo];
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

  async abrirModalCrear() {
    this.modalAbierto = true;
    if (!this.autores.length) {
      await this.cargarAutores();
    }
    if (!this.librosOriginal.length) {
      await this.cargarLibros();
    }
    if (!this.usuarios.length) {
      await this.cargarUsuarios();
    }
    
    // Limpiar suscripción anterior si existe
    if (this.autorSubscription) {
      this.autorSubscription.unsubscribe();
    }

    // Configurar nuevo listener para cuando cambie IdAutor
    this.autorSubscription = this.formNuevoPrestamo.get('IdAutor')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((idAutor) => {
        console.log('🔍 IdAutor cambió a:', idAutor);
        console.log('📚 librosOriginal disponibles:', this.librosOriginal.length);
        this.filtrarLibrosPorAutor(idAutor);
      }) || null;
  }

  cerrarCrearModal(reiniciar = true) {
    this.modalAbierto = false;
    // Limpiar la suscripción cuando se cierra el modal
    if (this.autorSubscription) {
      this.autorSubscription.unsubscribe();
      this.autorSubscription = null;
    }
    if (reiniciar) {
      this.formNuevoPrestamo.reset({
        FechaPrestamo: this.getFechaHoy(),
        IdAutor: null,
        IdLibro: null,
        IdUsuario: null,
        Latitud: null,
        Longitud: null,
      });
      this.libros = []; // Limpiar la lista de libros filtrados
    }
  }

  filtrarLibrosPorAutor(idAutor: number) {
    console.log('📖 Filtrando libros para IdAutor:', idAutor);
    if (!idAutor) {
      console.log('❌ IdAutor vacío, limpiando libros');
      this.libros = [];
      this.formNuevoPrestamo.patchValue({ IdLibro: null }, { emitEvent: false });
      return;
    }

    const idAutorNum = Number(idAutor);
    const autorSeleccionado = this.autores.find(
      (a: any) => Number(a?.IdAutor) === idAutorNum,
    );
    const nombreAutorSeleccionado = String(autorSeleccionado?.Nombre || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    const librosFiltrados = this.librosOriginal.filter((l: any) => {
      const stockDisponible = Number(l?.Stock ?? 0) > 0;
      if (!stockDisponible) {
        return false;
      }

      const tieneIdAutor = l?.IdAutor !== undefined && l?.IdAutor !== null;
      if (tieneIdAutor) {
        const coincidePorId = Number(l.IdAutor) === idAutorNum;
        console.log(`  Comparando por ID: libro.IdAutor=${l.IdAutor} vs idAutor=${idAutorNum} => ${coincidePorId}`);
        return coincidePorId;
      }

      const nombreAutorLibro = String(l?.Autor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
      const coincidePorNombre =
        !!nombreAutorSeleccionado && nombreAutorLibro === nombreAutorSeleccionado;
      console.log(`  Comparando por nombre: libro.Autor=${l?.Autor} vs autorSel=${autorSeleccionado?.Nombre} => ${coincidePorNombre}`);
      return coincidePorNombre;
    });
    
    console.log(`✅ Libros encontrados: ${librosFiltrados.length} de ${this.librosOriginal.length}`);
    this.libros = librosFiltrados;
    this.formNuevoPrestamo.patchValue({ IdLibro: null }, { emitEvent: false });
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

      console.log('👥 Autores cargados:', this.autores);
      if (this.autores.length > 0) {
        console.log('✍️ Primer autor:', this.autores[0]);
      }

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

  async cargarLibros() {
    this.cargandoLibros = true;
    try {
      const resp = await this.librosService.getLibros();
      const librosOrdenados = [...(resp || [])].sort((a: any, b: any) =>
        String(a?.Titulo || '').localeCompare(String(b?.Titulo || ''), 'es', {
          sensitivity: 'base',
          ignorePunctuation: true,
        }),
      );

      // Solo se prestan libros con stock disponible.
      this.librosOriginal = librosOrdenados.filter(
        (l: any) => Number(l?.Stock ?? 0) > 0,
      );

      console.log('📚 Libros cargados:', this.librosOriginal);
      if (this.librosOriginal.length > 0) {
        console.log('📖 Primer libro:', this.librosOriginal[0]);
      }

      if (librosOrdenados.length === 0) {
        const toast = await this.toastCtrl.create({
          message: 'No hay libros disponibles.',
          color: 'warning',
          duration: 2500,
        });
        await toast.present();
      } else if (this.librosOriginal.length === 0) {
        const toast = await this.toastCtrl.create({
          message: 'No hay libros con stock disponible para préstamo.',
          color: 'warning',
          duration: 2500,
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error al cargar libros:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudieron cargar los libros.',
        color: 'danger',
        duration: 2500,
      });
      await toast.present();
      this.librosOriginal = [];
    } finally {
      this.cargandoLibros = false;
    }
  }

  async cargarUsuarios() {
    this.cargandoUsuarios = true;
    try {
      const resp = await this.usuariosService.getUsuarios();
      this.usuarios = [...(resp || [])].sort((a: any, b: any) =>
        String(a?.Nombre || '').localeCompare(String(b?.Nombre || ''), 'es', {
          sensitivity: 'base',
          ignorePunctuation: true,
        }),
      );

      if (this.usuarios.length === 0) {
        const toast = await this.toastCtrl.create({
          message: 'No hay usuarios disponibles.',
          color: 'warning',
          duration: 2500,
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudieron cargar los usuarios.',
        color: 'danger',
        duration: 2500,
      });
      await toast.present();
      this.usuarios = [];
    } finally {
      this.cargandoUsuarios = false;
    }
  }

  async obtenerUbicacion() {
    this.cargandoUbicacion = true;
    try {
      let latitud: number;
      let longitud: number;

      if (Capacitor.getPlatform() === 'web') {
        const position = await this.obtenerUbicacionWeb();
        latitud = position.coords.latitude;
        longitud = position.coords.longitude;
      } else {
        await Geolocation.requestPermissions();
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        latitud = position.coords.latitude;
        longitud = position.coords.longitude;
      }
      
      this.formNuevoPrestamo.patchValue({
        Latitud: latitud,
        Longitud: longitud,
      });
      
      const toast = await this.toastCtrl.create({
        message: 'Ubicación obtenida correctamente',
        duration: 2500,
        color: 'success',
      });
      await toast.present();
    } catch (error: any) {
      console.error('Error al obtener la ubicación', error);

      const detalle = error?.message || error?.code || 'Permiso denegado o GPS desactivado';
      const toast = await this.toastCtrl.create({
        message: `Error al obtener la ubicación: ${detalle}`,
        duration: 4000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.cargandoUbicacion = false;
    }
  }

  private obtenerUbicacionWeb(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('El navegador no soporta geolocalización'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.formNuevoPrestamo.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  libroSeleccionadoSinStock(): boolean {
    const idLibro = Number(this.formNuevoPrestamo.get('IdLibro')?.value);
    if (!idLibro) return false;

    const libroSeleccionado = this.libros.find(
      (l: any) => Number(l?.IdLibro) === idLibro,
    );
    if (!libroSeleccionado) return false;

    const stock = Number(libroSeleccionado?.Stock ?? 0);
    return stock <= 0;
  }

  async guardarNuevoPrestamo() {
    if (this.libroSeleccionadoSinStock()) {
      const toast = await this.toastCtrl.create({
        message: 'El libro seleccionado no tiene stock disponible.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    if (this.formNuevoPrestamo.invalid) {
      this.formNuevoPrestamo.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa los campos requeridos.',
        color: 'warning',
        duration: 2500,
      });
      await toast.present();
      return;
    }

    const v = this.formNuevoPrestamo.value;
    const payload: PrestamosInsert = {
      FechaPrestamo: String(v.FechaPrestamo),
      IdLibro: Number(v.IdLibro),
      IdUsuario: Number(v.IdUsuario),
      Latitud: v.Latitud ? Number(v.Latitud) : undefined,
      Longitud: v.Longitud ? Number(v.Longitud) : undefined,
    };

    this.guardando = true;
    try {
      await firstValueFrom(this.prestamosService.Insertar(payload));
      const toast = await this.toastCtrl.create({
        message: 'Préstamo creado correctamente (Pendiente devolución).',
        color: 'success',
        duration: 2200,
      });
      await toast.present();
      this.cerrarCrearModal();
      await this.cargar();
    } catch (error) {
      console.error('Error al guardar préstamo:', error);
      const backendMessage = (error as any)?.error?.message;
      const toast = await this.toastCtrl.create({
        message: backendMessage || 'No se pudo guardar el préstamo.',
        color: 'danger',
        duration: 3000,
      });
      await toast.present();
    } finally {
      this.guardando = false;
    }
  }

  agregarPrestamo() {
    this.abrirModalCrear();
  }
}
