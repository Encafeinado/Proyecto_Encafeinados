import { AbstractControl, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';


//Validador de contraseña login
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

//Validador de dominio para correo
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