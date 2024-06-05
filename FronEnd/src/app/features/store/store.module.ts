import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreRoutingModule } from './store-routing.module';
import { StoreComponent } from './store.component';
import { StoreNavbarComponent } from './store-navbar/store-navbar.component';


@NgModule({
  declarations: [
    StoreComponent,
    StoreNavbarComponent
  ],
  imports: [
    CommonModule,
    StoreRoutingModule
  ]
})
export class StoreModule { }
