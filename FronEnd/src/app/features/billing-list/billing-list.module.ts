import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillingListRoutingModule } from './billing-list-routing.module';
import { BillingListComponent } from './billing-list.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    BillingListComponent
  ],
  imports: [
    CommonModule,
    BillingListRoutingModule,
    FormsModule
  ]
})
export class BillingListModule { }
