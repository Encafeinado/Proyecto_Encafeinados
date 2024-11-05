import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../interfaces';

export const IsAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authStatus = authService.authStatus();
  const currentUser = authService.currentUser();

  // Permitir acceso a las rutas '/perfil' y '/reset-password'
  if (state.url === '/perfil') {
    if (authStatus === AuthStatus.verify || authStatus === AuthStatus.authenticated) {
      return true;
    } else {
      return false;
    }
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
      } else if (currentUser && currentUser.roles.includes('admin')) {
        router.navigateByUrl('/admin-profile'); // Redirigir a admin-profile
      } else {
      
      }
      return false;
    }
  }

  return false;
};
