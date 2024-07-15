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
      next: (authenticated) => {
        if (authenticated) {
          // Mostrar Toastr con mensaje de éxito
          this.toastr.success('¡Inicio de sesión exitoso!', 'Éxito');
  
          // Redirigir al usuario a la página de la tienda
          this.router.navigateByUrl('/landing');
        } else {
          // Si no se autentica correctamente, probablemente debido a credenciales incorrectas
          this.toastr.error('Credenciales incorrectas', 'Error de inicio de sesión');
        }
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        // Mostrar Toastr con mensaje de error en caso de fallo en el inicio de sesión
        this.toastr.error('Error al iniciar sesión: ' + error.message, 'Error');
      }
    });
  }
}
