import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  public myForm: FormGroup = this.fb.group({
    name: ['', [ Validators.required ]],
    email: ['', [ Validators.required, Validators.email ]],
    password: ['', [ Validators.required, Validators.minLength(6) ]],
    phone: ['', [ Validators.required, Validators.pattern('^[0-9]+$') ]],
    specialties: [''], // Campo adicional para tienda
    address: ['']    // Campo adicional para tienda
  });

  public isUser: boolean = true;
  public isStore: boolean = false;
  public formTitle: string = 'Registro de Usuario';

  onUserTypeChange(type: string) {
    if (type === 'user') {
      this.isUser = true;
      this.isStore = false;
      this.formTitle = 'Registro de Usuario';
      this.myForm.get('specialties')?.clearValidators();
      this.myForm.get('address')?.clearValidators();
    } else if (type === 'store') {
      this.isUser = false;
      this.isStore = true;
      this.formTitle = 'Registro de Tienda';
      this.myForm.get('specialties')?.setValidators([Validators.required]);
      this.myForm.get('address')?.setValidators([Validators.required]);
    }
    this.myForm.get('specialties')?.updateValueAndValidity();
    this.myForm.get('address')?.updateValueAndValidity();
  }

  register() {
    if (this.myForm.invalid) {
      return;
    }

    const { name, email, password, phone, specialties, address } = this.myForm.value;

    if (this.isStore) {
      this.authService.registerStore(name, email, password, phone, specialties, address)
        .subscribe({
          next: () => {
            this.toastr.success('¡Registro de tienda exitoso!', 'Éxito');
            this.router.navigateByUrl('/auth/login');
          },
          error: (message) => {
            this.toastr.error(message, 'Error al registrar tienda');
          }
        });
    } else {
      this.authService.register(name, email, password, phone)
        .subscribe({
          next: () => {
            this.toastr.success('¡Registro de usuario exitoso!', 'Éxito');
            this.router.navigateByUrl('/auth/login');
          },
          error: (message) => {
            this.toastr.error(message, 'Error al registrar usuario');
          }
        });
    }
  }
}
