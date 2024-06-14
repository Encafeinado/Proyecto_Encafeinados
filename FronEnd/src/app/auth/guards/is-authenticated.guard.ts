// IsAuthenticatedGuard

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class IsAuthenticatedGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.authStatus() === AuthStatus.authenticated) {
      return true; // Permite el acceso a la ruta si está autenticado
    }
    this.router.navigateByUrl('/auth/login'); // Redirige a /auth/login si no está autenticado
    return false;
  }
}
