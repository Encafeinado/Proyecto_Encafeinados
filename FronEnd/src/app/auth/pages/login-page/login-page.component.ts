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

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  public myForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  login() {
    const { email, password } = this.myForm.value;
  
    this.authService.login(email, password)
      .subscribe({
        next: (user: User) => {
          console.log('User logged in:', user);  // <-- Log del usuario
          // Mostrar Toastr con mensaje de éxito
          this.toastr.success('¡Inicio de sesión exitoso!', 'Éxito');
          // Redirigir al usuario según su rol
          if (user && user.roles.includes('shop')) {
            this.router.navigateByUrl('/store');
          } else if (user && user.roles.includes('user')) {
            this.router.navigateByUrl('/map');
          } else {
            this.router.navigateByUrl('/');
          }
        },
        error: (message) => {
          // Mostrar Toastr con mensaje de error en caso de fallo en el inicio de sesión
          this.toastr.error(message, 'Error al iniciar sesión');
        }
      });
  }
  
}
