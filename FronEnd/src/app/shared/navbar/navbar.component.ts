import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, AfterViewInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); 
  public navbarText: string = 'Descubre el mejor café cerca de ti';
  userName: string = 'Nombre del Usuario';
  @ViewChild('sesionModal', { static: true }) sesionModal: any;
  modalRef!: NgbModalRef;
  openedModal = false;
  isLoading = true;

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    this.userName = currentUser ? currentUser.name : 'Nombre del Usuario';
    
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoading = false;
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isLoading = false;
      }
    });
  }

  

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  shouldShowLogout(): boolean {
    return this.authService.isAuthenticated() && this.isStoreOrMapRoute();
  }

  onLogout() {
    this.authService.logout();
  }

  setupDropdownToggle() {
    const dropdownButton = document.getElementById('userDropdown');
    const navbarCollapse = document.getElementById('navbarText');

    if (dropdownButton && navbarCollapse) {
      dropdownButton.addEventListener('click', () => {
        navbarCollapse.classList.toggle('show');
      });
    }
  }

  shouldShowMobileDropdown(): boolean {
    return (
      this.isUserLanding() || 
      this.isUserLandingTienda() || 
      
      (this.userName.trim().length > 0 && this.authService.isAuthenticated())
    );
  }
  
  

  
  isStoreOrMapRoute(): boolean {
    return (
      this.router.url === '/store' ||
      this.router.url === '/map' ||
      this.router.url === '/landing'||
      this.router.url === '/landing-tienda'
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

  isOnLandingPage(): boolean {
    return this.isUserLanding() || this.isUserLandingTienda();
  }
  
  isOnLoginPage(): boolean {
    return this.router.url === '/auth/login';
  }

  isOnRegisterPage(): boolean {
    return this.router.url === '/auth/register';
  }

  isOnRequestPage(): boolean {
    return this.router.url === '/auth/forgot-password';
  }

  isOnResetPage(): boolean {
    return this.router.url.split('?')[0] === '/auth/reset-password';
}


  isUserShop(): boolean {
    return this.authService.rolUser() === 'shop';
  }

  isUserUser(): boolean {
    return this.authService.rolUser() === 'user';
  }

  isUserLanding(): boolean {
    return this.router.url === '/landing';
  }

  isUserLandingTienda(): boolean {
    return this.router.url === '/landing-tienda';
  }
}
