import { AfterViewInit, ChangeDetectorRef, Component, computed, effect, inject, OnInit, ViewChild } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthStatus } from 'src/app/auth/interfaces';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); 
  public navbarText: string = 'Descubre el mejor café cerca de ti';
  userName: string = 'Nombre del Usuario';
  @ViewChild('sesionModal', { static: true }) sesionModal: any;
  modalRef!: NgbModalRef;
  openedModal = false;
  showCancelButton: boolean = false;
  isLoading = true;

  public finishedAuthCheck = computed<boolean>(() => {
    if (this.authService.authStatus() === AuthStatus.checking) {
      return false;
    }
    return true;
  });

  public authStatusChangedEffect = effect(() => {
    switch (this.authService.authStatus()) {
      case AuthStatus.checking:
        // El estado de autenticación está siendo verificado
        return;
  
      case AuthStatus.authenticated:
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.userName = currentUser.name || 'Nombre del Usuario';
          console.log('Nombre del usuario:', this.userName);
  
          if (currentUser.roles.includes('user')) {
            // Usuario normal autenticado
            if (this.router.url === '/shop') {
              this.router.navigateByUrl('/landing');
            }
          } else if (currentUser.roles.includes('shop')) {
            // Tienda autenticada
            if (this.router.url === '/landing') {
              this.router.navigateByUrl('/shop');
            }
          }
        }
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
  
  
  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoading = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isLoading = false;
        this.updateNavbarText(event.url);
        this.cdr.detectChanges(); 
      }
    });

   
    const currentUser = this.authService.currentUser();
    this.userName = currentUser ? currentUser.name : 'Nombre del Usuario';
    console.log('Nombre del usuario inicial:', this.userName);
  }

  ngAfterViewInit() {
   
    this.cdr.detectChanges();
  }

  

  updateNavbarText(url: string): void {
    if (url === '/store' || url === '/landing') {
      this.navbarText = 'Descubre el mejor café cerca de ti';
    } else if (url === '/map') {
      this.navbarText = 'Explora las ubicaciones en el mapa';
    } else {
      this.navbarText = 'Descubre el mejor café cerca de ti';
    }
  }

  onLogout() {
    this.authService.logout();
  }

  isStoreOrMapRoute(): boolean {
 
    return (
      this.router.url === '/store' ||
      this.router.url === '/map' ||
      this.router.url === '/landing'
    );
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



   isUserShop(): boolean {
    return this.authService.rolUser() === 'shop';
  }

  isUserUser(): boolean {
    return this.authService.rolUser() === 'user';
  }
}