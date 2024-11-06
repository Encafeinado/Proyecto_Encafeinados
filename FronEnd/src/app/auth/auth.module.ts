import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { RequestResetPasswordComponent } from './pages/request-reset-password-page/request-reset-password.component';
import { ResetPasswordComponent } from './pages/reset-password-page/reset-password.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginAdminPageComponent } from './pages/login-admin-page/login-admin-page.component';


@NgModule({
  declarations: [
    LoginPageComponent,
    LoginAdminPageComponent,
    RegisterPageComponent,
    AuthLayoutComponent,
    RequestResetPasswordComponent,
    ResetPasswordComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class AuthModule { }