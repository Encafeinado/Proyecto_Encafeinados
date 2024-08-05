import { AbstractControl, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Validador de contraseña login
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const value = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValid = hasUpperCase && hasNumber && hasSpecialChar;
    return !isValid ? { 'passwordInvalid': true } : null;
  };
}

// Validador de dominio para correo
export function emailDomainValidator(validDomains: string[]): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
    const email = control.value ? control.value.toLowerCase() : '';

    if (!email) {
      return of(null); 
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return of({ invalidEmailFormat: true });
    }
    const domain = email.split('@')[1];
    if (!domain || !validDomains.some(validDomain => domain === validDomain)) {
      return of({ invalidDomain: true }); 
    }
    return of(null);
  };
}


export function validateEmail(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
    const email = control.value ? control.value.toLowerCase() : '';

    if (!email) {
      return of(null); // Correo vacío es válido
    }

    return authService.checkEmailAvailability(email).pipe(
      map(isAvailable => {
        if (isAvailable) {
          return null; // El correo está disponible
        } else {
          return { emailTaken: true }; // El correo ya está en uso
        }
      }),
      catchError(() => of({ emailTaken: true })) // Manejo de errores
    );
  };
}


// Validador de nombre con símbolos y números
export function validateNameSimbolAndNumber(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
    const nameValue = control.value || '';
    // Patrón actualizado para permitir solo letras y espacios
    const combinedPattern = /^(?!.*\s{2})[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/;

    return new Observable(observer => {
      setTimeout(() => {
        if (combinedPattern.test(nameValue)) {
          // No se permiten números en el nombre
          const numberCount = (nameValue.match(/\d/g) || []).length;
          if (numberCount === 0) {
            observer.next(null); // Válido
          } else {
            observer.next({ invalidName: true }); // No válido
          }
        } else {
          observer.next({ invalidName: true }); // No válido
        }
        observer.complete();
      }, 0);
    });
  };



  
}
