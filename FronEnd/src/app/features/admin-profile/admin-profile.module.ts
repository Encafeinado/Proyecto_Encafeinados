import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminProfileRoutingModule } from './admin-profile-routing.module';
import { AdminProfileComponent } from './admin-profile.component';


@NgModule({
  declarations: [
    AdminProfileComponent
  ],
  imports: [
    CommonModule,
    AdminProfileRoutingModule
  ]
})
export class AdminProfileModule { }