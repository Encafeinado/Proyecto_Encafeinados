import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsNotAuthenticatedGuard } from './auth/guards/is-not-authenticated.guard';
import { IsAuthenticatedGuard } from './auth/guards/is-authenticated.guard';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [IsNotAuthenticatedGuard] },
  { path: 'store', loadChildren: () => import('./features/store/store.module').then(m => m.StoreModule), canActivate: [IsAuthenticatedGuard], data: { role: 'shop' } },
  { path: 'map', loadChildren: () => import('./features/map/map.module').then(m => m.MapModule), canActivate: [IsAuthenticatedGuard], data: { role: 'user' } },
  { path: 'landing', loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule), canActivate: [IsNotAuthenticatedGuard] },
  { path: 'perfil', loadChildren: () => import('./features/mi-perfil/mi-perfil.module').then(m => m.MiPerfilModule), canActivate: [IsAuthenticatedGuard] },
  { path: 'landing-tienda', loadChildren: () => import('./features/landing-tienda/landing-tienda.module').then(m => m.LandingTiendaModule), canActivate: [IsNotAuthenticatedGuard] },
  { path: 'admin-profile', loadChildren: () => import('./features/admin-profile/admin-profile.module').then(m => m.AdminProfileModule)}, 
  // { path: '**', redirectTo: '/landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
