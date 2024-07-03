import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { RegisterShopComponent } from './pages/register-shop/register-shop.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';


@NgModule({
  declarations: [
    LoginPageComponent,
    RegisterPageComponent,
    RegisterShopComponent,
    AuthLayoutComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
  ]
})
export class AuthModule { }