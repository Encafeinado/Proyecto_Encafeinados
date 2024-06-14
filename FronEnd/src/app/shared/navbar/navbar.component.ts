import { Component, computed, effect, inject, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthStatus } from 'src/app/auth/interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // Inyecta ChangeDetectorRef

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
        this.cdr.detectChanges(); // Forzar verificación de cambios
        return;
  
      case AuthStatus.notAuthenticated:
        const currentUrl = this.router.url;
        if (currentUrl !== '/auth/register') {
          this.router.navigateByUrl('/auth/login');
          this.cdr.detectChanges(); // Forzar verificación de cambios
        }
        return;
    }
  });
  

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarText(event.url);
        this.cdr.detectChanges(); // Forzar verificación de cambios
      }
    });
  }

  ngAfterViewInit() {
    // Forzar la detección de cambios después de la inicialización de la vista
    this.cdr.detectChanges();
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
