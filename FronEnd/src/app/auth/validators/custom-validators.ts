import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Validador de contraseña login
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const value = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\\[\]\-+\/;]/.test(value);
    const isValid = hasUpperCase && hasNumber && hasSpecialChar;
    return !isValid ? { 'passwordInvalid': true } : null;
  };
}

export function passwordAsyncValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.parent?.get('email')?.value;
    const password = control.value;

    if (!email || !password) {
      return of(null); // No se puede validar sin email o password
    }

    return authService.validatePassword(email, password).pipe(
      map(response => response.valid ? null : { invalidPassword: true }),
      catchError(() => of({ invalidPassword: true })) // Manejo de errores
    );
  };
}

export function emailDomainValidator(validDomains: string[]): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value ? control.value.toLowerCase() : '';

    if (!email) {
      return of(null); // Correo vacío es válido
    }

    // Extraer el dominio del correo electrónico
    const domain = email.split('@')[1];
    if (!domain || !validDomains.some(validDomain => domain === validDomain)) {
      return of({ invalidDomain: true });
    }

    // Si el dominio es válido, no devolver errores
    return of(null);
  };
}


export function emailFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value ? control.value.toLowerCase() : '';

    if (!email) {
      return null; // Correo vacío es válido
    }

    // Validar el formato del correo electrónico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) ? null : { invalidEmailFormat: true };
  };
}

// Validador asíncrono de formato de correo electrónico
export function emailFormatAsyncValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return of(emailFormatValidator()(control)); // Usar el validador síncrono dentro del asíncrono
  };
}


export function matchPasswordValidator(): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    return password && confirmPassword && password !== confirmPassword 
      ? { 'mismatch': true } 
      : null;
  };
}

// Validador personalizado para números de teléfono móvil
export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const phoneNumber = control.value ? control.value.toString() : '';
    // Validar que el número de teléfono contenga solo dígitos
    const isValidPhoneNumber = /^\d+$/.test(phoneNumber);
    // Validar longitud mínima y máxima (ejemplo: entre 10 y 11 dígitos)

    return !isValidPhoneNumber 
      ? { 'invalidPhoneNumber': true }
      : null;
  };
}



//validacion de correo para registro
export function validateEmail(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
    const email = control.value ? control.value.toLowerCase() : '';

    if (!email) {
      return of(null); // Correo vacío es válido
    }

    return authService.checkEmailAvailability(email).pipe(
      map(isRegistered  => {
        if (isRegistered) {
          return null; // El correo está disponible
        } else {
          return { emailTaken: true }; // El correo ya está en uso
        }
      }),
      catchError(() => of({ emailTaken: true })) // Manejo de errores
    );
  };
}


export function validateEmailForLogin(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value ? control.value.toLowerCase() : '';

    if (!email) {
      return of(null); // Correo vacío es válido
    }

    return authService.checkEmailExistence(email).pipe(
      map(response => {
        if (response?.emailNotRegistered) {
          return { emailNotRegistered: true };
        }
        return null;
      }),
      catchError(() => of({ emailNotRegistered: true })) // Manejo de errores
    );
  };
}


// Validador de nombre con símbolos y números
export function validateNameSimbolAndNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nameValue = control.value || '';
    // Patrón actualizado para permitir solo letras y espacios
    const combinedPattern = /^(?!.*\s{2})[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/;

    // Validar que el valor cumpla con el patrón
    if (!combinedPattern.test(nameValue)) {
      return { invalidName: true }; // No válido
    }

    // Verificar que no tenga números
    const numberCount = (nameValue.match(/\d/g) || []).length;
    if (numberCount > 0) {
      return { invalidName: true }; // No válido si tiene números
    }

    return null; // Válido
  };
}

