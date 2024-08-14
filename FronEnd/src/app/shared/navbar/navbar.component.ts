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
  
  
  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    // Inicializa el nombre del usuario
    const currentUser = this.authService.currentUser();
    this.userName = currentUser ? currentUser.name : 'Nombre del Usuario';
    console.log('Nombre del usuario inicial:', this.userName);
    
    // Actualiza el texto del navbar basado en la ruta actual al iniciar

    // Escucha los eventos de navegación para actualizar el texto del navbar
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

  

  onLogout() {
    this.authService.logout();
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

  isOnLandingPage(): boolean {
    return this.isUserLanding() || this.isUserLandingTienda();
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

  isUserLanding(): boolean {
    return this.router.url === '/landing';
  }

  isUserLandingTienda(): boolean {
    return this.router.url === '/landing-tienda';
  }
}
