import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsNotAuthenticatedGuard } from './auth/guards/is-not-authenticated.guard';
import { IsAuthenticatedGuard } from './auth/guards/is-authenticated.guard';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [IsNotAuthenticatedGuard] },
  { path: 'store', loadChildren: () => import('./features/store/store.module').then(m => m.StoreModule), canActivate: [IsAuthenticatedGuard], data: { role: 'shop' } },
  { path: 'map', loadChildren: () => import('./features/map/map.module').then(m => m.MapModule), canActivate: [IsAuthenticatedGuard], data: { role: 'user' } },
  { path: 'landing', loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule), canActivate: [IsAuthenticatedGuard] },
  {path: 'perfil', loadChildren: () => import('./features/mi-perfil/mi-perfil.module').then(m => m.MiPerfilModule), canActivate: [IsAuthenticatedGuard]},
  { path: '**', redirectTo: '/auth/login' } // Redirige a login si la ruta no coincide
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
