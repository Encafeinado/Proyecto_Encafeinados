import { Component } from '@angular/core';
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
  public myForm: FormGroup;
  public userRole: string = 'user'; // Valor predeterminado
  hidePassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.myForm = this.fb.group({
      email: ['julian@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required] // Campo para seleccionar el rol (predeterminado es 'user')
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  login(): void {
    if (this.myForm.invalid) {
      this.toastr.error('Por favor, completa el formulario correctamente');
      return;
    }

    const { email, password, role } = this.myForm.value;

    this.authService.login(email, password, role).subscribe(
      (response) => {
        console.log('Login successful', response);
        if (role === 'user') {
          this.router.navigate(['/user-landing']);
        } else if (role === 'shop') {
          this.router.navigate(['/shop-landing']);
        } else {
          this.toastr.error('Rol no reconocido');
        }
      },
      (error) => {
        console.error('Error logging in', error);
        this.toastr.error('Error al iniciar sesión');
      }
    );
  }
}
