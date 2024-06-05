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


  public myForm: FormGroup = this.fb.group({
    email: ['jul@gmail.com', [ Validators.required, Validators.email ]],
    password: ['123456', [ Validators.required, Validators.minLength(6) ]],
  });


  login() {
    const { email, password } = this.myForm.value;
  
    this.authService.login(email, password)
      .subscribe({
        next: () => {
          // Mostrar Toastr con mensaje de éxito
          this.toastr.success('¡Inicio de sesión exitoso!', 'Éxito');
          // Redirigir al usuario a la página de la tienda
          this.router.navigateByUrl('/store');
        },
        error: (message) => {
          // Mostrar Toastr con mensaje de error en caso de fallo en el inicio de sesión
          this.toastr.error(message, 'Error al iniciar sesión');
        }
      });
    }
  }
