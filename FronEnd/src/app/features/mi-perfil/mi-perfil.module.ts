import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiPerfilRoutingModule } from './mi-perfil-routing.module';
import { MiPerfilComponent } from './mi-perfil.component';


@NgModule({
  declarations: [
    MiPerfilComponent
  ],
  imports: [
    CommonModule,
    MiPerfilRoutingModule
  ]
})
export class MiPerfilModule { }
