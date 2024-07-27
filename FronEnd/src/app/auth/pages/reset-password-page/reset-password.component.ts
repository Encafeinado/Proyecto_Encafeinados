import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  token: string = ''; 
  resetForm: FormGroup;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router 
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      console.log('Reset Password Token:', this.token);

      if (!this.token) {
        this.router.navigateByUrl('/landing');
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup): void {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  resetPassword() {
    if (this.resetForm.valid && this.token) {
      const { password } = this.resetForm.value;
      console.log('Enviando solicitud para restablecer contraseña con token:', this.token);
      this.authService.resetPassword(this.token, password).subscribe({
        next: () => {
          console.log('Contraseña restablecida con éxito, redirigiendo a login.');
          this.router.navigateByUrl('/landing');
        },
        error: (err) => {
          console.error('Error al restablecer la contraseña:', err);
          alert('Error al restablecer la contraseña. Por favor, inténtelo de nuevo.');
        }
      });
    } else {
      if (!this.token) {
        alert('Token no proporcionado.');
      }
      if (!this.resetForm.valid) {
        alert('Por favor, complete el formulario correctamente.');
      }
    }
  }
}
