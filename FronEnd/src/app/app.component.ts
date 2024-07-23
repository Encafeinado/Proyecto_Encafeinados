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
  public navbarText: string = 'Descubre el mejor café cerca de ti';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isLoading = false;
        this.showNavbar = !event.url.includes('/auth/login') && !event.url.includes('/auth/register');
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

  updateNavbarText(url: string): void {
    if (url === '/store' || url === '/landing') {
      this.navbarText = 'Descubre el mejor café cerca de ti';
    } else if (url === '/map') {
      this.navbarText = 'Explora las ubicaciones en el mapa';
    } else {
      this.navbarText = 'Descubre el mejor café cerca de ti';
    }
  }

  public authStatusChangedEffect = effect(() => {
    switch (this.authService.authStatus()) {
      case AuthStatus.checking:
        return;
  
      case AuthStatus.authenticated:
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.userName = currentUser.name || 'Nombre del Usuario';
          console.log('Nombre del usuario:', this.userName);
          this.updateNavbarText(this.router.url); // Actualizar el texto del navbar basado en la URL
        }
        this.router.navigateByUrl('/landing');
        this.cdr.detectChanges();
        return;
  
      case AuthStatus.notAuthenticated:
        const currentUrl = this.router.url;
        if (currentUrl !== '/auth/register') {
          this.router.navigateByUrl('/auth/login');
          this.cdr.detectChanges();
        }
        return;
    }
  });



}


