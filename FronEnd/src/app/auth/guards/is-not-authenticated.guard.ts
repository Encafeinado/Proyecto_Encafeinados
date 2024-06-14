// IsNotAuthenticatedGuard

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class IsNotAuthenticatedGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.authStatus() === AuthStatus.authenticated) {
      this.router.navigateByUrl('/store'); // Redirige a /store si ya está autenticado
      return false;
    }
    return true; // Permite el acceso a la ruta si no está autenticado
  }
}
