// src/app/pages/login-page/login-page.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { emailDomainValidator, emailFormatAsyncValidator, emailFormatValidator, passwordValidator, validateEmailForLogin} from '../../validators/custom-validators'; // Importa aquí


@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  public myForm: FormGroup;
  emailTouched = false;
  hidePassword: boolean = true;
  validDomains = [ "gmail.com","gmail.co","gmail.es","gmail.mx","hotmail.com","hotmail.co","hotmail.es","hotmail.mx","outlook.com","outlook.co","outlook.es","outlook.mx","yahoo.com","yahoo.co","yahoo.es",
    "yahoo.mx","gmail.com.co","hotmail.com.co","outlook.com.co","yahoo.com.co","gmail.com.es","hotmail.com.es","outlook.com.es","yahoo.com.es","gmail.com.mx","hotmail.com.mx","outlook.com.mx",
    "yahoo.com.mx"]; 


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
    
  ) {
    this.myForm = this.fb.group({
      email: [
        '',
        [
          Validators.required
        ],
        [
          validateEmailForLogin(this.authService),
          emailFormatAsyncValidator(), // Validador asíncrono para chequeo adicional
          emailDomainValidator(this.validDomains) // Validador de dominio
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          passwordValidator() 
        ]
      ],
      role: ['user']
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  get emailControl() {
    return this.myForm.get('email');
  }

  onEmailBlur() {
    this.emailTouched = true;
    this.emailControl?.markAsTouched();
  }

  isErrorVisible() {
    return this.emailTouched || this.emailControl?.dirty;
  }

  


  login(): void {
    if (this.myForm.invalid) {
      this.toastr.error('Por favor, completa el formulario correctamente');
      return;
    }
    const { email, password } = this.myForm.value;
  
    this.authService.login(email, password).subscribe(
      (response) => {
        if (response) {
          this.toastr.success('Inicio de sesión exitoso');
          // Redirige o maneja el éxito
          this.router.navigate(['/landing']); // Ajusta la ruta según tu aplicación
        } else {
          this.toastr.error('Correo o contraseña incorrectas');
        }
      },
      (error) => {

        this.toastr.error(error.message || 'Error al iniciar sesión. Por favor, intenta de nuevo más tarde.');
      }
    );
  }
}  
