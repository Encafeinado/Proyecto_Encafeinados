import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  public myForm: FormGroup;
  hidePassword: boolean = true;
  public userRole: string = 'user'; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user']
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

    this.authService.login(email, password).subscribe(
      (response) => {
        if (response) {
         
          this.toastr.success('Inicio de sesión exitoso');
         
        } else {
       
          this.toastr.error('Credenciales incorrectas');
        }
      },
      (error) => {
        console.error('Error al iniciar sesión', error);
        this.toastr.error('Error al iniciar sesión. Por favor, intenta de nuevo más tarde.');
      }
    );
  }
}