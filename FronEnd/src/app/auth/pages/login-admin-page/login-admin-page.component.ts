// src/app/pages/login-page/login-page.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { emailDomainValidator, emailFormatAsyncValidator, emailFormatValidator, passwordAsyncValidator, passwordValidator, validateEmailForLogin} from '../../validators/custom-validators'; // Importa aquí


@Component({
  templateUrl: './login-admin-page.component.html',
  styleUrls: ['./login-admin-page.component.css']
})
export class LoginAdminPageComponent {
  public myForm: FormGroup;
  public isShop: boolean = false;
  public showError = false; // Controla cuándo mostrar el mensaje de error
  emailTouched = false;
  hidePassword: boolean = true;
  
  validDomains = [ "gmail.com","gmail.co","gmail.es","gmail.mx","hotmail.com","hotmail.co","hotmail.es","hotmail.mx","outlook.com","outlook.co","outlook.es","outlook.mx","yahoo.com","yahoo.co","yahoo.es",
    "yahoo.mx","gmail.com.co","hotmail.com.co","outlook.com.co","yahoo.com.co","gmail.com.es","hotmail.com.es","outlook.com.es","yahoo.com.es","gmail.com.mx","hotmail.com.mx","outlook.com.mx",
    "yahoo.com.mx","yopmail.com","@icloud.com","aliencreativo.com"]; 


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
    
    
  ) {
    this.myForm = this.fb.group({
      email: ['',{
          validators: [Validators.required],
          asyncValidators: [
            
            emailDomainValidator(this.validDomains) // Validador de dominio
          ],
          updateOn: 'change'
        }],
      password: ['',{
          validators:[        
          Validators.required,
        ],
        asyncValidators: [
       
        ],
       updateOn: 'change'
    }],
      role: ['user']
    });
  }
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  get emailControl() {
    return this.myForm.get('email');
  }

   // Este método oculta el error si el formulario se vuelve válido
   onInputChange(): void {
    if (this.myForm.valid) {
      this.showError = false; // Ocultar el error si los datos son correctos
    }
  }

  
  
 

  login(): void {
    if (this.myForm.invalid) {
      this.showError = true; // Muestra el mensaje de error
      return;
    }

    const { email, password } = this.myForm.value;

    this.authService.loginAdmin(email, password).subscribe(
      (response) => {
        if (response) {
          this.toastr.success('Inicio de sesión exitoso');
          this.router.navigate(['/landing']);
        } else {
          this.showError = true; // Muestra el mensaje de error si la autenticación falla
        }
      },
      () => {
        this.showError = true; // Maneja el error general
      }
    );
  }
}