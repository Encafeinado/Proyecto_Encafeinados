import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingTiendaComponent } from './landing-tienda.component';
import { LandingTiendaRoutingModule } from './landing-tienda-routing.module';



@NgModule({
  declarations: [
    LandingTiendaComponent
  ],
  imports: [
    CommonModule,
    LandingTiendaRoutingModule
  ]
})
export class LandingTiendaModule { }
