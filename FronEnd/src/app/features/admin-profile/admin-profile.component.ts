import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { StoreService } from 'src/app/service/store.service'; 
import { ReviewService } from '../../service/reviews.service';
import { UserService } from 'src/app/service/user.service'; 

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {
  userData: any;
  reviews: any[] = [];  // Aquí se almacenarán las reviews
  userRole: string = 'admin';
  totalClients: number = 0;   // Total de clientes (codeUsage)
  totalShops: number = 0;     // Total de tiendas registradas
  shopsWithAverageRatings: any[] = [];  // Array para almacenar cada tienda con su promedio de calificaciones
  totalCafecoins: number = 0;
  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private reviewService: ReviewService,
    private userService: UserService,
    private cdr: ChangeDetectorRef // Inyectamos ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadTotalClients(); 
    this.loadTotalShops();
    this.loadTotalCafecoins();
    this.loadReviews(); 
  }
  loadTotalCafecoins(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        this.totalCafecoins = users.reduce((total, user) => total + user.cafecoin, 0); // Sumamos todos los cafecoins
        console.log('Total cafecoins:', this.totalCafecoins);
        this.cdr.detectChanges(); // Forzar la detección de cambios
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }
  // Cargar datos del usuario actual
  loadUserData(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado.');
      return;
    }
    this.userData = currentUser;
    console.log('Datos del usuario:', this.userData);
  }

  // Cargar las reviews
  loadReviews(): void {
    this.reviewService.getAllReviews().subscribe(
      (data) => {
        this.reviews = data;
        console.log('Reviews cargadas:', this.reviews);
      },
      (error) => {
        console.error('Error al cargar las reviews:', error);
      }
    );
  }

  // Cargar y sumar el número total de clientes (codeUsage) de todas las tiendas
  loadTotalClients(): void {
    this.storeService.getAllShops().subscribe(
      (shops) => {
        this.totalClients = shops.reduce((total, shop) => total + shop.codeUsage, 0); // Sumar los codeUsage
        console.log('Total clientes:', this.totalClients);
        this.cdr.detectChanges(); // Forzamos la detección de cambios
      },
      (error) => {
        console.error('Error al cargar las tiendas:', error);
      }
    );
  }

  // Cargar el número total de tiendas y calcular el promedio de calificaciones de cada tienda
  loadTotalShops(): void {
    this.storeService.getAllShops().subscribe(
      (shops) => {
        this.totalShops = shops.length;  // Contamos cuántas tiendas están registradas
        console.log('Total de tiendas registradas:', this.totalShops);

        // Calcular el promedio de ratings para cada tienda
        this.shopsWithAverageRatings = shops.map(shop => {
          const averageRating = shop.ratings && shop.ratings.length > 0
            ? shop.ratings.reduce((acc: number, cur: { stars: number }) => acc + cur.stars, 0) / shop.ratings.length
            : 0;
          return {
            ...shop,
            averageRating // Agregamos el promedio de ratings a cada tienda
          };
        });

        console.log('Shops with average ratings:', this.shopsWithAverageRatings);
        this.cdr.detectChanges(); // Forzamos la detección de cambios
      },
      (error) => {
        console.error('Error al cargar las tiendas:', error);
      }
    );
  }
}
