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
      role: ['user'] // Campo para seleccionar el rol (predeterminado es 'user')
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
        
        if (role === 'shop') {
          
          this.router.navigate(['/shop']);
        } else {
     
          this.router.navigate(['/auth']);
        }
      },
      (error) => {
        console.error('Error logging in', error);
        this.toastr.error('Error al iniciar sesión');
      }
    );
  }
}