import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { emailDomainValidator, validateEmailForLogin } from '../../validators/custom-validators';

@Component({
  selector: 'app-request-reset-password',
  templateUrl: './request-reset-password.component.html'
})
export class RequestResetPasswordComponent {
  requestResetForm: FormGroup;
  validDomains = [
    "gmail.com", "gmail.co","yopmail.com", "gmail.es", "gmail.mx", "hotmail.com", "hotmail.co", "hotmail.es", "hotmail.mx",
    "outlook.com", "outlook.co", "outlook.es", "outlook.mx", "yahoo.com", "yahoo.co", "yahoo.es", "yahoo.mx",
    "gmail.com.co", "hotmail.com.co", "outlook.com.co", "yahoo.com.co", "gmail.com.es", "hotmail.com.es",
    "outlook.com.es", "yahoo.com.es", "gmail.com.mx", "hotmail.com.mx", "outlook.com.mx", "yahoo.com.mx"
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.requestResetForm = this.fb.group({
      email: ['', {
        validators: [
          Validators.required,    // Verifica que sea un correo válido
        ],
        asyncValidators: [
          validateEmailForLogin(this.authService),
          emailDomainValidator(this.validDomains)
        ],
        updateOn: 'blur'  // Para que los validadores asíncronos se apliquen cuando el campo pierde el enfoque
      }]
    });
  }


  requestReset() {
    if (this.requestResetForm.valid) {
      this.authService.forgotPassword(this.requestResetForm.value.email)
        .subscribe({
          next: () => {
            this.toastr.success('Correo de restablecimiento enviado');
          },
          error: (error) => {
            // Manejo de errores específicos basados en el código de estado
            if (error.status === 404) {
              this.toastr.error('Correo electrónico no registrado');
            } else {
              this.toastr.error('Error al enviar el correo de restablecimiento');
            }
          }
        });
    }
  }
}
