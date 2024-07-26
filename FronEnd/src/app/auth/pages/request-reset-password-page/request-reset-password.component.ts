import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-request-reset-password',
  templateUrl: './request-reset-password.component.html'
})
export class RequestResetPasswordComponent {
  requestResetForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private toastr: ToastrService) {
    this.requestResetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
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
