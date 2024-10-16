import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentComponent } from './payment.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PaymentComponent
  ],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    FormsModule  
  ]
})
export class PaymentModule { }
