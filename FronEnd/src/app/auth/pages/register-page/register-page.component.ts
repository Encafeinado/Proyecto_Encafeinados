// register-page.component.ts
import { Component, inject, HostListener, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';
import { GeocodingService } from 'src/app/service/geocoding.service';
import { emailDomainValidator, emailFormatAsyncValidator, passwordValidator, phoneNumberValidator, validateEmail, validateNameSimbolAndNumber } from '../../validators/custom-validators';
import { DataTreatmentDialogComponent } from 'src/app/data-treatment-dialog/data-treatment-dialog.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';




interface CustomFile {
  filename: string;
  filetype: string;
  value: string | ArrayBuffer | null;
}

@Component({
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterPageComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private geocodingService = inject(GeocodingService); // Inyecta el servicio de geocodificación
  private MatDialogModule = inject(MatDialog);

  validDomains = ["gmail.com", "gmail.co", "gmail.es", "gmail.mx", "hotmail.com", "hotmail.co", "hotmail.es", "hotmail.mx", "outlook.com", "outlook.co", "outlook.es", "outlook.mx", "yahoo.com", "yahoo.co", "yahoo.es",
    "yahoo.mx", "gmail.com.co", "hotmail.com.co", "outlook.com.co", "yahoo.com.co", "gmail.com.es", "hotmail.com.es", "outlook.com.es", "yahoo.com.es", "gmail.com.mx", "hotmail.com.mx", "outlook.com.mx",
    "yahoo.com.mx","yopmail.com"];

  public myForm: FormGroup = this.fb.group({
    name: ['sdfsdfsdf', [
      Validators.required,
      Validators.maxLength(30),
      Validators.minLength(3)
    ], [validateNameSimbolAndNumber()]],

    email: ['sdfsfsfs@gmail.com', 
      {
        validators: [
      Validators.required,
    ], 
    asyncValidators: [
     
         // emailFormatAsyncValidator(),
          validateEmail(this.authService),
          emailDomainValidator(this.validDomains)
        ],
        updateOn: 'blur'
      }
    ],
      
    password: ['Julian90*', [
      Validators.required,
      Validators.minLength(8),
      passwordValidator()
    ]],

    confirmPassword: ['Julian90*', [
      Validators.required
    ]],

    phone: ['3156783389', [ // Cambia el nombre del campo a 'phone'
      Validators.required,
      phoneNumberValidator()
    ]],

    specialties1: [''],
    specialties2: [''],
    address: [''],
    logo: [''],
    statusShop: [false]  // Campo oculto con valor predeterminado
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


  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
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

    // Abre el diálogo y espera la respuesta
    const dialogRef = this.MatDialogModule.open(DataTreatmentDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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
                      this.router.navigateByUrl('/auth/login');
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
      } else {
        // Usuario no aceptó el tratamiento de datos
        console.log('Usuario no aceptó el tratamiento de datos.');
      }
    });
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
