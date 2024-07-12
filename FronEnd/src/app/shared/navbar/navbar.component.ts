import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, computed, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
  userName: string = 'Nombre del Usuario';
  @ViewChild('sesionModal', { static: true }) sesionModal: any;
  modalRef!: NgbModalRef;
  openedModal = false;
  showCancelButton: boolean = false;

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
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          if (currentUser.roles.includes('user')) {
            // Usuario normal autenticado
            this.userName = currentUser.name || 'Nombre del Usuario';
            console.log('Nombre del usuario:', this.userName);
            this.router.navigateByUrl('/landing');
          } else if (currentUser.roles.includes('shop')) {
            // Tienda autenticada
            this.userName = currentUser.name || 'Nombre del Usuario';
            console.log('Nombre del usuario:', this.userName);
            this.router.navigateByUrl('/shop');
          }
        }
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

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarText(event.url);
        this.cdr.detectChanges(); // Forzar verificación de cambios
      }
    });

    // Asignar el nombre del usuario desde el servicio de autenticación
    const currentUser = this.authService.currentUser();
    this.userName = currentUser ? currentUser.name : 'Nombre del Usuario';
    console.log('Nombre del usuario inicial:', this.userName);
  }

  ngAfterViewInit() {
    // Forzar la detección de cambios después de la inicialización de la vista
    this.cdr.detectChanges();
  }

  updateNavbarText(url: string): void {
    if (url === '/store' || url === '/landing') {
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
    return this.router.url === '/store' || this.router.url === '/map' || this.router.url === '/landing';
  }

  openModal(content: any): void {
    if (!this.openedModal) {
      this.openedModal = true;
      this.modalRef = this.modalService.open(content, {
        centered: true,
        backdrop: 'static',
      });
      this.modalRef.result.then(
        () => {
          this.openedModal = false;
        },
        () => {
          this.openedModal = false;
        }
      );
    }
  }

  openLogoutModal(content: any): void {
    this.openModal(content);
  }

  confirmLogout(): void {
    this.authService.logout();
    this.modalRef.close();
  }


  // Método para verificar si el usuario es de tipo "shop"
  // isUserShop(): boolean {
  //   return this.authService.rolUser === 'user';
  // }

  // // Método para verificar si el usuario es de tipo "user"
  // isUserUser(): boolean {
  //   return this.authService.rolUser === 'shop';
  // }
}
