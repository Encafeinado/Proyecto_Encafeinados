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
  shopWithMostCodeUsage: any; // Tienda con más redenciones de código
  codigosUsados: boolean = false; // Nueva propiedad para el término de búsqueda

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

  // Método para cargar el total de cafecoins
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

  // Método para cargar los datos del usuario
  loadUserData(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado.');
      return;
    }
    this.userData = currentUser;
    console.log('Datos del usuario:', this.userData);
  }

  // Método para cargar las reviews
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

  // Método para cargar el total de clientes (usuarios registrados)
  loadTotalClients(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        this.totalClients = users.length; // Contamos el total de usuarios registrados
        console.log('Total usuarios registrados:', this.totalClients);
        this.cdr.detectChanges(); // Forzamos la detección de cambios
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }

  // Método para cargar el total de tiendas y sus datos
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
  
        // Encontrar la tienda con más redenciones de código (codeUsage)
        const shopWithCodeUsage = shops.filter(shop => shop.codeUsage > 0);
        
        if (shopWithCodeUsage.length > 0) {
          this.shopWithMostCodeUsage = shopWithCodeUsage.reduce((prev, current) => {
            return (prev.codeUsage > current.codeUsage) ? prev : current;
          });
        } else {
          this.codigosUsados = true;
          this.shopWithMostCodeUsage = null; // Ninguna tienda ha redimido códigos
        }
  
        console.log('Tienda con más codeUsage:', this.shopWithMostCodeUsage);
        this.cdr.detectChanges(); // Forzamos la detección de cambios
      },
      (error) => {
        console.error('Error al cargar las tiendas:', error);
      }
    );
  }
}