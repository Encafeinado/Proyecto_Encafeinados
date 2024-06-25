import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Importa ToastrService

import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService); // Inyecta ToastrService

  public myForm: FormGroup = this.fb.group({
    name: ['', [ Validators.required ]],
    email: ['', [ Validators.required, Validators.email ]],
    password: ['', [ Validators.required, Validators.minLength(6) ]],
    phone: ['', [ Validators.required, Validators.pattern('^[0-9]+$') ]],
  });

  register() {
    const { name, email, password, phone } = this.myForm.value;

    this.authService.register(name, email, password, phone)
      .subscribe({
        next: () => {
          // Mostrar Toastr con mensaje de éxito
          this.toastr.success('¡Registro exitoso!', 'Éxito');
          // Redirigir al usuario a la página de inicio de sesión
          this.router.navigateByUrl('/auth/login');
        },
        error: (message) => {
          // Mostrar Toastr con mensaje de error en caso de fallo en el registro
          this.toastr.error(message, 'Error al registrar');
        }
      });
  }
}
