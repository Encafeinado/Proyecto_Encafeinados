import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isNotAuthenticatedGuard } from './auth/guards/is-not-authenticated.guard';
import { isAuthenticatedGuard } from './auth/guards';

const routes: Routes = [
  

  {
    path: 'auth',
    canActivate: [ isNotAuthenticatedGuard ],
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule ),
  },
  //{path: 'login', loadChildren: ()=> import('./features/login/login.module').then(m => m.LoginModule)},
  {path: 'store',canActivate: [ isAuthenticatedGuard ], loadChildren: ()=> import('./features/store/store.module').then(m => m.StoreModule)},
  {path: 'map', loadChildren: ()=> import('./features/map/map.module').then(m => m.MapModule)},
  { path: '**', redirectTo: 'auth' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
