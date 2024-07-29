import { Component, ChangeDetectorRef, computed, effect, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AuthStatus } from './auth/interfaces';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private authService = inject( AuthService );
  isLoading = true;
  showNavbar = true;
  userName: string = 'Nombre del Usuario';
  //public navbarText: string = 'Descubre el mejor café cerca de ti';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isLoading = false;
        // Ajuste aquí para no ocultar la barra de navegación en la ruta de restablecimiento de contraseña
        this.showNavbar = !event.url.includes('/auth/login') && 
                          !event.url.includes('/auth/register') && 
                          !event.url.includes('/auth/forgot-password') &&
                          !event.url.includes('/auth/reset-password') ;
        this.cdr.detectChanges(); 
      }
    });
  }
  
  public finishedAuthCheck = computed<boolean>( () => {
    console.log(this.authService.authStatus() )
    if ( this.authService.authStatus() === AuthStatus.checking ) {
      return false;
    }

    return true;
  });

  public authStatusChangedEffect = effect(() => {
    const authStatus = this.authService.authStatus();
    console.log('Estado de autenticación:', authStatus);
  
    switch (authStatus) {
      case AuthStatus.checking:
        return;
  
      case AuthStatus.authenticated:
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.userName = currentUser.name || 'Nombre del Usuario';
          console.log('Nombre del usuario:', this.userName);
  
          if (currentUser.roles.includes('user')) {
            this.router.navigateByUrl('/map');
          } else if (currentUser.roles.includes('shop')) {
            this.router.navigateByUrl('/store');
          } else {
            this.router.navigateByUrl('/landing');
          }
        }
        return;
  
      case AuthStatus.notAuthenticated:
        const currentUrl = this.router.url;
        console.log('URL actual:', currentUrl);
  
        // Redirigir a la página de inicio si la URL actual no es pública
        if (currentUrl !== '/auth/login' && currentUrl !== '/landing' && currentUrl !== '/auth/reset-password') {
          this.router.navigateByUrl('/landing');
        }
        return;
  
      default:
        console.warn('Estado de autenticación no reconocido:', authStatus);
        return;
    }
  });
  
  



}


