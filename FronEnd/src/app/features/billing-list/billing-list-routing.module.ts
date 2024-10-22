import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingListComponent } from './billing-list.component';

const routes: Routes = [
  {path: '', component: BillingListComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingListRoutingModule { }
