import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';

interface CustomFile {
  filename: string;
  filetype: string;
  value: string | ArrayBuffer | null;
}

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
    confirmPassword: ['', [ Validators.required ]],
    phone: ['', [ Validators.required, Validators.pattern('^[0-9]+$') ]],
    specialties1: [''],
    specialties2: [''],
    address: [''],
    logo: ['']
  }, {
    validators: this.passwordMatchValidator 
  });

  public isUser: boolean = true;
  public isStore: boolean = false;
  public formTitle: string = 'Registro de Usuario';
  logoFile: CustomFile | null = null;
  hidePassword: boolean = true;
  hidePasswordconfirm: boolean = true;

  onUserTypeChange(type: string) {
    if (type === 'user') {
      this.isUser = true;
      this.isStore = false;
      this.formTitle = 'Registro de Usuario';
      this.myForm.get('specialties1')?.clearValidators();
      this.myForm.get('specialties2')?.clearValidators();
      this.myForm.get('address')?.clearValidators();
    } else if (type === 'store') {
      this.isUser = false;
      this.isStore = true;
      this.formTitle = 'Registro de Tienda';
      this.myForm.get('specialties1')?.setValidators([Validators.required]);
      this.myForm.get('specialties2')?.setValidators([Validators.required]);
      this.myForm.get('address')?.setValidators([Validators.required]);
    }
    this.myForm.get('specialties1')?.updateValueAndValidity();
    this.myForm.get('specialties2')?.updateValueAndValidity();
    this.myForm.get('address')?.updateValueAndValidity();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoFile = {
          filename: file.name,
          filetype: file.type,
          value: reader.result
        };
        this.myForm.patchValue({ logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
  togglePasswordVisibilityconfirm() {
    this.hidePasswordconfirm = !this.hidePasswordconfirm;
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  register() {
    if (this.myForm.invalid) {
      return;
    }

    const { name, email, password, phone, specialties1,specialties2, address, logo } = this.myForm.value;

    if (this.isStore) {
      this.authService.registerStore(name, email, password, phone, specialties1,specialties2, address, logo)
        .subscribe({
          next: () => {
            this.toastr.success('¡Registro de tienda exitoso!', 'Éxito');
            this.router.navigateByUrl('/auth/login');
          },
          error: (err) => {
            console.error('Error al registrar tienda:', err);
            this.toastr.error('Error al registrar tienda', 'Error');
          }
        });
    } else {
      this.authService.register(name, email, password, phone)
        .subscribe({
          next: () => {
            this.toastr.success('¡Registro de usuario exitoso!', 'Éxito');
            this.router.navigateByUrl('/auth/login');
          },
          error: (err) => {
            console.error('Error al registrar usuario:', err);
            this.toastr.error('Error al registrar usuario', 'Error');
          }
        });
    }
  }
}