import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full' },
  {path: 'login', loadChildren: ()=> import('./features/login/login.module').then(m => m.LoginModule)},
  {path: 'store', loadChildren: ()=> import('./features/store/store.module').then(m => m.StoreModule)},
  {path: 'map', loadChildren: ()=> import('./features/map/map.module').then(m => m.MapModule)},
  { path: '**', redirectTo: '/login' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
