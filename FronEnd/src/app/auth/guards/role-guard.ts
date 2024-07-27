import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    const currentUser = this.authService.currentUser();

    if (currentUser && currentUser.roles.some(role => expectedRoles.includes(role))) {
      return true;
    } else {
      console.log(`Redirigiendo a /landing desde ${state.url}`);
      if (state.url !== '/landing') {
        this.router.navigate(['/landing']);
      }
      return false;
    }
    
  }}
