import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';

interface CustomFile {
  filename: string;
  filetype: string;
  value: string | ArrayBuffer | null; // Cambiado a solo aceptar string o ArrayBuffer
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
    phone: ['', [ Validators.required, Validators.pattern('^[0-9]+$') ]],
    specialties: [''], // Campo adicional para tienda
    address: [''], // Campo adicional para tienda
    logo: [''] // Agrega validador para logo
  });

  public isUser: boolean = true;
  public isStore: boolean = false;
  public formTitle: string = 'Registro de Usuario';
  logoFile: CustomFile | null = null;

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

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoFile = {
          filename: file.name,
          filetype: file.type,
          value: reader.result // El resultado del FileReader ya es un string o ArrayBuffer
        };
        this.myForm.patchValue({ logo: reader.result }); // Actualiza el valor del campo logo en el formulario
      };
      reader.readAsDataURL(file);
    }
  }

  register() {
    if (this.myForm.invalid) {
      return;
    }
  
    const { name, email, password, phone, specialties, address, logo } = this.myForm.value;
  
    // Verifica que logo tenga datos antes de enviar la solicitud
    console.log('Logo base64:', logo);
  
    if (this.isStore) {
      this.authService.registerStore(name, email, password, phone, specialties, address, logo)
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