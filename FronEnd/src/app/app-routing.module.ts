import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsNotAuthenticatedGuard } from './auth/guards/is-not-authenticated.guard';
import { IsAuthenticatedGuard } from './auth/guards/is-authenticated.guard';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' }, // Redirigir cuando no hay ruta específica
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [IsNotAuthenticatedGuard] },
  { path: 'store', loadChildren: () => import('./features/store/store.module').then(m => m.StoreModule), canActivate: [IsAuthenticatedGuard], data: { role: 'shop' } },
  { path: 'map', loadChildren: () => import('./features/map/map.module').then(m => m.MapModule), canActivate: [IsAuthenticatedGuard], data: { role: 'user' } },
  { path: 'landing', loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule), canActivate: [IsNotAuthenticatedGuard] },
  { path: 'perfil', loadChildren: () => import('./features/mi-perfil/mi-perfil.module').then(m => m.MiPerfilModule), canActivate: [IsAuthenticatedGuard] },
  { path: 'payment', loadChildren: () => import('./features/payment/payment.module').then(m => m.PaymentModule) },
  { path: 'billing-list', loadChildren: () => import('./features/billing-list/billing-list.module').then(m=> m.BillingListModule)},
  { path: 'landing-tienda', loadChildren: () => import('./features/landing-tienda/landing-tienda.module').then(m => m.LandingTiendaModule), canActivate: [IsNotAuthenticatedGuard] },
  { path: 'admin-profile', loadChildren: () => import('./features/admin-profile/admin-profile.module').then(m => m.AdminProfileModule), canActivate: [IsAuthenticatedGuard], data: { role: 'admin' }}, 
  
  { path: '**', redirectTo: 'landing' } // Redirigir rutas desconocidas a /landing
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
