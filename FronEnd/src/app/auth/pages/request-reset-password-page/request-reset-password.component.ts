import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { emailDomainValidator, validateEmailForLogin } from '../../validators/custom-validators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-reset-password',
  templateUrl: './request-reset-password.component.html',
  styleUrls: ['./request-reset-password.component.css'],

})
export class RequestResetPasswordComponent {
  public requestResetForm: FormGroup;
  public showError = false; // Controla cuándo mostrar el mensaje de error
  validDomains = [
    "gmail.com", "gmail.co","yopmail.com", "gmail.es", "gmail.mx", "hotmail.com", "hotmail.co", "hotmail.es", "hotmail.mx",
    "outlook.com", "outlook.co", "outlook.es", "outlook.mx", "yahoo.com", "yahoo.co", "yahoo.es", "yahoo.mx",
    "gmail.com.co", "hotmail.com.co", "outlook.com.co", "yahoo.com.co", "gmail.com.es", "hotmail.com.es",
    "outlook.com.es", "yahoo.com.es", "gmail.com.mx", "hotmail.com.mx", "outlook.com.mx", "yahoo.com.mx","icloud.com","aliencreativo.com"
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.requestResetForm = this.fb.group({
      email: ['', {
        validators: [
          Validators.required,    // Verifica que sea un correo válido
        ],
        asyncValidators: [
          emailDomainValidator(this.validDomains)
        ],
        updateOn: 'change'  // Para que los validadores asíncronos se apliquen cuando el campo pierde el enfoque
      }]
    });
  }

  onInputChange(): void {
    if (this.requestResetForm.valid) {
      this.showError = false; // Ocultar el error si los datos son correctos
    }
  }
  requestReset(): void {
    if (this.requestResetForm.valid) {
      this.authService.forgotPassword(this.requestResetForm.value.email)
        .subscribe({
          next: () => {
            this.toastr.success('Correo de restablecimiento enviado');
            this.router.navigate(['/landing']); // Redirige a la página de landing
          },
          error: (error) => {
            // Manejo de errores específicos basados en el código de estado
            if (error.status === 404) {
              this.showError = true;
            } else {
              
            }
          }
        });
    }
  }
}
