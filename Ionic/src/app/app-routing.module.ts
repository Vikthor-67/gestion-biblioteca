import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder/inbox',
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    loadChildren: () =>
      import('./folder/folder.module').then((m) => m.FolderPageModule),
  },
  {
    path: 'autor',
    loadChildren: () =>
      import('./autor/autor.module').then((m) => m.AutorPageModule),
  },
  {
    path: 'detalle-autor/:IdAutor',
    loadChildren: () =>
      import('./detalle-autor/detalle-autor.module').then(
        (m) => m.DetalleAutorPageModule,
      ),
  },
  {
    path: 'libro',
    loadChildren: () =>
      import('./libro/libro.module').then((m) => m.LibroPageModule),
  },
  {
    path: 'detalle-libro/:IdLibro',
    loadChildren: () =>
      import('./detalle-libro/detalle-libro.module').then(
        (m) => m.DetalleLibroPageModule,
      ),
  },
  {
    path: 'prestamo',
    loadChildren: () =>
      import('./prestamo/prestamo.module').then((m) => m.PrestamoPageModule),
  },
  {
    path: 'detalle-prestamo/:IdPrestamo',
    loadChildren: () =>
      import('./detalle-prestamo/detalle-prestamo.module').then(
        (m) => m.DetallePrestamoPageModule,
      ),
  },
  {
    path: 'usuario',
    loadChildren: () =>
      import('./usuario/usuario.module').then((m) => m.UsuarioPageModule),
  },
  {
    path: 'detalle-usuario/:IdUsuario',
    loadChildren: () =>
      import('./detalle-usuario/detalle-usuario.module').then(
        (m) => m.DetalleUsuarioPageModule,
      ),
  },
  {
    path: 'huella',
    loadChildren: () =>
      import('./huella/huella.module').then((m) => m.HuellaPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
