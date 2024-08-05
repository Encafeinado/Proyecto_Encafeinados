import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingTiendaComponent } from './landing-tienda.component';

const routes: Routes = [
  { path: '', component: LandingTiendaComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingTiendaRoutingModule { }
