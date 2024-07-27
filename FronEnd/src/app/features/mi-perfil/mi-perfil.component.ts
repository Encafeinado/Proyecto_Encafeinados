import { Component, OnInit } from '@angular/core';
import { ShopService } from 'src/app/service/shop.service';
import { UserService } from 'src/app/service/user.service';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit {
  userData: any;
  shopData: any;
  userRole: string = '';

  constructor(
    private userService: UserService,
    private shopService: ShopService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado.');
      return;
    }

    this.userRole = currentUser.roles ? currentUser.roles[0] : '';
    if (this.userRole === 'shop') {
      this.fetchShopData();
    } else {
      this.userData = currentUser;
      console.log('Datos del usuario:', this.userData);
    }
  }

  fetchShopData(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado en el almacenamiento local.');
      return;
    }

    this.shopService.fetchShopData(token).subscribe(
      (data: any) => {
        this.shopData = data;
        console.log('Datos de la tienda:', this.shopData);
      },
      (error) => {
        console.error('Error al obtener los datos de la tienda:', error);
      }
    );
  }
}
