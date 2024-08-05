// register-page.component.ts
import { Component, inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';
import { GeocodingService } from 'src/app/service/geocoding.service';
import { validateEmail, validateNameSimbolAndNumber } from '../../validators/custom-validators';


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
  private geocodingService = inject(GeocodingService); // Inyecta el servicio de geocodificación

  public myForm: FormGroup = this.fb.group({
    name: ['',[Validators.required, Validators.maxLength(30),Validators.minLength(3)],[validateNameSimbolAndNumber()]],
    email: ['', [Validators.required, Validators.email], [validateEmail(this.authService)]],
    password: ['', [ Validators.required, Validators.minLength(3) ]],
    confirmPassword: ['', [ Validators.required ]],
    phone: ['', [ Validators.required, Validators.pattern('^[0-9]+$') ]],
   // specialties1: [''],
    //specialties2: [''],
    //address: [''],
    //logo: [''],
    //statusShop: [false]  // Campo oculto con valor predeterminado
  }, {
    validators: this.passwordMatchValidator 
  });

  public isUser: boolean = true;
  public isStore: boolean = false;
  public formTitle: string = 'Registro de Usuario';
  suggestedAddresses: string[] = [];
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

  onAddressChange(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      this.geocodingService.autocompleteAddress(query).subscribe((response) => {
        this.suggestedAddresses = response.map((result: any) => result.display_name);
      });
    }
  }

  selectAddress(address: string) {
    this.myForm.patchValue({ address });
    this.suggestedAddresses = [];
  }

  

  register() {
    if (this.myForm.invalid) {
      return;
    }

    const { name, email, password, phone, specialties1, specialties2, address, logo } = this.myForm.value;

    if (this.isStore) {
      this.geocodingService.geocodeAddress(address).subscribe({
        next: (response) => {
          if (response.length > 0) {
            const { lat, lon } = response[0];
            console.log('Latitud:', lat, 'Longitud:', lon);
            console.log('Dirección: ', address);
            this.authService.registerStore(name, email, password, phone, specialties1, specialties2, address, logo, lat, lon, false)
              .subscribe({
                next: () => {
                  this.toastr.success('¡Registro de tienda exitoso!', 'Éxito');
                  console.log(name, email, password, phone, specialties1, specialties2, address, logo, lat, lon, false);
                  // this.router.navigateByUrl('/auth/login');
                },
                error: (err) => {
                  console.error('Error al registrar tienda:', err);
                  this.toastr.error('Error al registrar tienda', 'Error');
                }
              });
          } else {
            this.toastr.error('No se pudo geocodificar la dirección', 'Error');
          }
        },
        error: (err) => {
          console.error('Error al geocodificar la dirección:', err);
          this.toastr.error('Error al geocodificar la dirección', 'Error');
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

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.wrap-input100') && !target.closest('.address-suggestions')) {
      this.suggestedAddresses = [];
    }
  }

  onInputChange(event: any): void {
    const address = event.target.value;
    if (!address) {
      this.suggestedAddresses = [];
    }
  }
}
