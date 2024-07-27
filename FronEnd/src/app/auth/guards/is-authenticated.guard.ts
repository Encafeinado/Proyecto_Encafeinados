import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces';

export const IsAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authStatus = authService.authStatus();
  const currentUser = authService.currentUser();

  if (state.url === '/perfil') {
    return true;
  }

  if (authStatus === AuthStatus.authenticated) {
    const expectedRole = route.data['role'] as string;
    if (currentUser && currentUser.roles.includes(expectedRole)) {
      return true;
    } else {
      // Redirige a la página correspondiente basada en el rol
      if (currentUser && currentUser.roles.includes('user')) {
        router.navigateByUrl('/map');
      } else if (currentUser && currentUser.roles.includes('shop')) {
        router.navigateByUrl('/store');
      } else {
        router.navigateByUrl('/landing');
      }
      return false;
    }
  }

  router.navigateByUrl('/landing');
  return false;
};
