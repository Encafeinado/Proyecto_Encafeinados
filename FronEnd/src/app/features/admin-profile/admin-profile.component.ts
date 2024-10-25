import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { StoreService } from 'src/app/service/store.service'; 
import { ReviewService } from '../../service/reviews.service';
import { UserService } from 'src/app/service/user.service'; 
import { AlbumService } from 'src/app/service/album.service';

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
  codigosUsados: boolean = false;

  top5ShopsByCodeUsage: any[] = [];
  top5ShopsByAverageRating: any[] = [];
  top5UsersByCafecoins: any[] = [];
  top5UsersByCafecoinsAndStickers: any[] = [];
  top5UsersByStickers: any[] = [];
  totalLocalClients: number = 0;    // Total de usuarios locales
  totalForeignClients: number = 0;  // Total de usuarios extranjeros

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private reviewService: ReviewService,
    private userService: UserService,
    private albumService: AlbumService,
    private cdr: ChangeDetectorRef // Inyectamos ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadTotalClients(); 
    this.loadTotalShops();
    this.loadTotalCafecoins();
    this.loadReviews(); 
    this.loadTop5ShopsByCodeUsage();
    this.loadTop5ShopsByAverageRating();
    this.loadTop5UsersByCafecoins();
    this.loadTop5UsersByStickers();
    this.loadTop5UsersByCafecoinsAndStickers();
    this.loadTotalLocalClients();
    this.loadTotalForeignClients();
  }

  loadTotalCafecoins(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        this.totalCafecoins = users.reduce((total, user) => total + user.cafecoin, 0); // Sumamos todos los cafecoins
        // console.log('Total cafecoins:', this.totalCafecoins);
        this.cdr.detectChanges(); // Forzar la detección de cambios
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }

  loadUserData(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado.');
      return;
    }
    this.userData = currentUser;
    // console.log('Datos del usuario:', this.userData);
  }

  loadReviews(): void {
    this.reviewService.getAllReviews().subscribe(
      (data) => {
        this.reviews = data;
        // console.log('Reviews cargadas:', this.reviews);
      },
      (error) => {
        console.error('Error al cargar las reviews:', error);
      }
    );
  }

  loadTotalClients(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        this.totalClients = users.length; // Contamos el total de usuarios registrados
        // console.log('Total usuarios registrados:', this.totalClients);
        this.cdr.detectChanges(); // Forzamos la detección de cambios
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }

  loadTotalShops(): void {
    this.storeService.getAllShops().subscribe(
      (shops) => {
        this.totalShops = shops.length;  // Contamos cuántas tiendas están registradas
        // console.log('Total de tiendas registradas:', this.totalShops);
  
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
  
        // console.log('Tienda con más codeUsage:', this.shopWithMostCodeUsage);
        this.cdr.detectChanges(); // Forzamos la detección de cambios
      },
      (error) => {
        console.error('Error al cargar las tiendas:', error);
      }
    );
  }

   // Obtener el top 5 de tiendas por códigos usados
   loadTop5ShopsByCodeUsage(): void {
    this.storeService.getAllShops().subscribe(
      (shops) => {
        this.top5ShopsByCodeUsage = shops
          .sort((a, b) => b.codeUsage - a.codeUsage) // Ordenar por codeUsage descendente
          .slice(0, 5); // Tomar las primeras 5 tiendas
      },
      (error) => {
        console.error('Error al obtener el top 5 de tiendas por código usado:', error);
      }
    );
  }

  // Obtener el top 5 de tiendas por promedio de calificaciones
  loadTop5ShopsByAverageRating(): void {
    this.storeService.getAllShops().subscribe(
      (shops) => {
        this.top5ShopsByAverageRating = shops
          .map(shop => ({
            ...shop,
            averageRating: shop.ratings && shop.ratings.length > 0
              ? shop.ratings.reduce((acc: number, cur: { stars: number }) => acc + cur.stars, 0) / shop.ratings.length
              : 0
          }))
          .sort((a, b) => b.averageRating - a.averageRating) // Ordenar por promedio descendente
          .slice(0, 5); // Tomar las primeras 5 tiendas
      },
      (error) => {
        console.error('Error al obtener el top 5 de tiendas por promedio:', error);
      }
    );
  }

  // Obtener el top 5 de usuarios por cafecoins
  loadTop5UsersByCafecoins(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        this.top5UsersByCafecoins = users
          .sort((a, b) => b.cafecoin - a.cafecoin) // Ordenar por cafecoins descendente
          .slice(0, 5); // Tomar los primeros 5 usuarios
      },
      (error) => {
        console.error('Error al obtener el top 5 de usuarios por cafecoins:', error);
      }
    );
  }

  loadTop5UsersByStickers(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        // Traer la data de los álbumes
        this.albumService.getAllAlbums().subscribe(
          (albums) => {
            const userStickerCounts = users.map(user => {
              // Encontrar el álbum relacionado con el usuario
              const album = albums.find(a => a.nameUser === user.name);
              const stickerCount = album ? album.images.length : 0;
              
              return {
                name: user.name,
                stickerCount: stickerCount,
              };
            });

            // Ordenar por cantidad de estampitas y tomar el top 5
            this.top5UsersByStickers = userStickerCounts
              .sort((a, b) => b.stickerCount - a.stickerCount)
              .slice(0, 5);

            this.cdr.detectChanges(); 
          },
          (error) => {
            console.error('Error al obtener los álbumes:', error);
          }
        );
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }

  loadTop5UsersByCafecoinsAndStickers(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        this.albumService.getAllAlbums().subscribe(
          (albums) => {
            const userStickerAndCafecoinCounts = users.map(user => {
              // Encontrar el álbum relacionado con el usuario
              const album = albums.find(a => a.nameUser === user.name);
              const stickerCount = album ? album.images.length : 0;
  
              return {
                name: user.name,
                cafecoin: user.cafecoin,
                stickerCount: stickerCount,
                // Calculamos un puntaje priorizando las estampitas sobre los cafecoins
                score: stickerCount * 10 + user.cafecoin // Se da mayor peso a las estampitas
              };
            });
  
            // Ordenar primero por estampitas (stickerCount) y luego por cafecoins
            this.top5UsersByCafecoinsAndStickers = userStickerAndCafecoinCounts
              .sort((a, b) => {
                if (b.stickerCount === a.stickerCount) {
                  return b.cafecoin - a.cafecoin; // Si tienen la misma cantidad de estampitas, ordenar por coffecoins
                }
                return b.stickerCount - a.stickerCount; // Priorizar estampitas
              })
              .slice(0, 5); // Tomar los primeros 5 usuarios
  
            this.cdr.detectChanges(); // Forzar la detección de cambios
          },
          (error) => {
            console.error('Error al obtener los álbumes:', error);
          }
        );
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }
  
   // Método para cargar el total de clientes locales
   loadTotalLocalClients(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        this.totalLocalClients = users.filter(user => user.origin === 'Local').length;
        // console.log('Total de clientes locales:', this.totalLocalClients);
        this.cdr.detectChanges(); 
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }

  // Método para cargar el total de clientes extranjeros
  loadTotalForeignClients(): void {
    this.userService.fetchAllUsers().subscribe(
      (users) => {
        this.totalForeignClients = users.filter(user => user.origin === 'Extranjero').length;
        // console.log('Total de clientes extranjeros:', this.totalForeignClients);
        this.cdr.detectChanges(); 
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }
}