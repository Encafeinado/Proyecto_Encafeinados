import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Importa ToastrService
import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService); // Inyecta ToastrService
  token: string = ''; // Inicializar con una cadena vacía

  public myForm: FormGroup = this.fb.group({
    email: ['', [ Validators.required, Validators.email ]],
    password: ['', [ Validators.required, Validators.minLength(6) ]],
  });

  login() {
    const { email, password } = this.myForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response) {
          this.token = localStorage.getItem('token') || '';
          console.log('Token almacenado:', this.token);

          // Mostrar Toastr con mensaje de éxito
          this.toastr.success('¡Inicio de sesión exitoso!', 'Éxito');
          // Redirigir al usuario a la página de la tienda
          this.router.navigateByUrl('/store');
        } else {
          console.error('Respuesta inválida del servidor:', response);
          this.toastr.error('Respuesta inválida del servidor', 'Error');
        }
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        // Mostrar Toastr con mensaje de error en caso de fallo en el inicio de sesión
        this.toastr.error('Error al iniciar sesión: ' + error, 'Error');
      }
    });
  }
}
