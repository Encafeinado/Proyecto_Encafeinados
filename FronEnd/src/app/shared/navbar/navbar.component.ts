import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthStatus } from 'src/app/auth/interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  public navbarText: string = 'Descubre el mejor café cerca de ti';

  public finishedAuthCheck = computed<boolean>(() => {
    if (this.authService.authStatus() === AuthStatus.checking) {
      return false;
    }
    return true;
  });

  public authStatusChangedEffect = effect(() => {
    switch (this.authService.authStatus()) {
      case AuthStatus.checking:
        return;

      case AuthStatus.authenticated:
        this.router.navigateByUrl('/store');
        return;

      case AuthStatus.notAuthenticated:
        this.router.navigateByUrl('/auth/login');
        return;
    }
  });

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarText(event.url);
      }
    });
  }

  updateNavbarText(url: string): void {
    if (url === '/store') {
      this.navbarText = 'Descubre el mejor café cerca de ti';
    } else if (url === '/map') {
      this.navbarText = 'Explora las ubicaciones en el mapa';
    } else {
      this.navbarText = 'Descubre el mejor café cerca de ti'; // Texto por defecto
    }
  }

  onLogout() {
    this.authService.logout();
  }

  isStoreOrMapRoute(): boolean {
    // Verifica si estamos en la ruta de /store o /map
    return this.router.url === '/store' || this.router.url === '/map';
  }
}