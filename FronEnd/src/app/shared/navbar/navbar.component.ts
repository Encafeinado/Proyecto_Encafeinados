import { Component, ChangeDetectorRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AuthStatus } from 'src/app/auth/interfaces';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  
  isLoading = true;
  userName = 'Nombre del Usuario';
  navbarText = 'Descubre el mejor café cerca de ti';
  modalRef!: NgbModalRef;
  openedModal = false;

  @ViewChild('sesionModal', { static: true }) sesionModal: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarText(event.url);
      }
    });

    const currentUser = this.authService.currentUser();
    this.userName = currentUser ? currentUser.name || 'Nombre del Usuario' : 'Nombre del Usuario';
    console.log('Nombre del usuario inicial:', this.userName);
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  updateNavbarText(url: string): void {
    if (this.authService.rolUser === 'user') {
      if (url === '/landing') {
        this.navbarText = 'Descubre el mejor café cerca de ti';
      } else if (url === '/map') {
        this.navbarText = 'Explora las ubicaciones en el mapa';
      } else {
        this.navbarText = 'Descubre el mejor café cerca de ti';
      }
    } else if (this.authService.rolUser === 'shop') {
      if (url === '/store' || url === '/landing') {
        this.navbarText = 'Gestiona tu tienda de café';
      } else {
        this.navbarText = 'Descubre el mejor café cerca de ti';
      }
    }
    this.cdr.detectChanges(); // Detecta los cambios después de actualizar el texto del navbar
  }

  onLogout(): void {
    this.authService.logout();
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
    return this.authService.rolUser === 'shop';
  }

  isUserUser(): boolean {
    return this.authService.rolUser === 'user';
  }

  isStoreOrMapRoute(): boolean {
    return this.router.url === '/store' || this.router.url === '/map' || this.router.url === '/landing';
  }
}
