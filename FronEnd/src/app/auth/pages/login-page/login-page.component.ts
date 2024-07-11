import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces'; // Asegúrate de importar la interfaz User

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService // Inyecta ToastrService
  ) {}

  public myForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  hidePassword: boolean = true; // Variable para controlar la visibilidad de la contraseña

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  login(): void {
    const { email, password } = this.myForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response) {
          // Guardar el token en localStorage (suponiendo que tu AuthService maneja esto)
          const token = localStorage.getItem('token') || '';
          console.log('Token almacenado:', token);

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
