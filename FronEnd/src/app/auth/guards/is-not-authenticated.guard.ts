import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces';

export const IsNotAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authStatus() === AuthStatus.authenticated) {
    // Redirigir a la página principal si el usuario está autenticado
    router.navigateByUrl('/map'); // o '/store' o cualquier ruta principal
    return false;
  }

  return true;
};
