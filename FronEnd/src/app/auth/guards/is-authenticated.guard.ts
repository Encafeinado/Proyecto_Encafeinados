import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces';

export const IsAuthenticatedGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (authService.authStatus() === AuthStatus.authenticated) {
    if (route.data['role'] && currentUser?.roles.includes(route.data['role'])) {
      return true;
    } else {
      // Si no tiene el rol adecuado, redirigir a una ruta por defecto basada en su rol actual
      const redirectRoute = currentUser?.roles.includes('shop') ? '/store' : '/map';
      router.navigateByUrl(redirectRoute);
      return false;
    }
  }

  // Redirigir al login si no está autenticado
  router.navigateByUrl('/auth/login');
  return false;
};
