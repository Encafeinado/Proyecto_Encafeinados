import {
  Component,
  ChangeDetectorRef,
  computed,
  effect,
  inject,
} from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { AuthStatus } from './auth/interfaces';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private authService = inject(AuthService);
  isLoading = true;
  showNavbar = true;
  userName: string = 'Nombre del Usuario';
  //public navbarText: string = 'Descubre el mejor café cerca de ti';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (window.location.hash === '/#/' || window.location.hash === '#') {
        this.router.navigate(['/landing']);}

      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;
        // Ajuste aquí para no ocultar la barra de navegación en la ruta de restablecimiento de contraseña
       // this.showNavbar =
         // !event.url.includes('/auth/reset-password');
        // this.cdr.detectChanges();
      }
    });
  }

  public finishedAuthCheck = computed<boolean>(() => {
    console.log(this.authService.authStatus());
    if (this.authService.authStatus() === AuthStatus.checking) {
      return false;
    }

    return true;
  });

  public authStatusChangedEffect = effect(() => {
    const authStatus = this.authService.authStatus();
    console.log('Estado de autenticación:', authStatus);
  
    switch (authStatus) {
      case AuthStatus.authenticated:
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.userName = currentUser.name || 'Nombre del Usuario';
    
          // Verifica si es admin y redirige a /admin-profile
          if (this.router.url !== '/map' && this.router.url !== '/store' && this.router.url !== '/admin-profile') {
            if (currentUser.roles.includes('user')) {
              this.router.navigateByUrl('/map');
            } else if (currentUser.roles.includes('shop')) {
              this.router.navigateByUrl('/store');
            } else if (currentUser.roles.includes('admin')) {
              this.router.navigateByUrl('/admin-profile'); // Redirige a /admin-profile para admin
            }
          }
        }
        return;
  
      case AuthStatus.notAuthenticated:
        // Redirigir solo si el usuario está en una página privada
        const currentUrl = this.router.url;
        if (currentUrl !== '/auth/login' && currentUrl !== '/landing') {
        
        }
        return;
    }
  });
  
}
