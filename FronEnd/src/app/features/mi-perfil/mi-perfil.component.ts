import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/service/store.service'; 
import { AuthService } from 'src/app/auth/services/auth.service';
import { ReviewService } from '../../service/reviews.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit {
  userData: any;
  shopData: any;
  reviews: any[] = [];
  userRole: string = '';
  shopLogos: { name: string; logoUrl: string }[] = [];

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private userService: UserService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    // window.location.reload();
    this.loadUserData();
    this.loadReviews(); 
    setInterval(() => {
      this.actualizarDatosUsuario();
    }, 5000); // 10 segundos
  }
  actualizarDatosUsuario(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado en el almacenamiento local.');
      return;
    }
  
    if (!this.userData || !this.userData.email) {
      console.error('Datos del usuario o email no están definidos.');
      return;
    }
  
    this.userService.fetchUserData(token).subscribe(
      (data: any[]) => {
        console.log('Datos completos del usuario:', data);
  
        // Encuentra el usuario correcto dentro del array usando el email
        const usuario = data.find(u => u.email === this.userData.email); 
  
        if (usuario && usuario.cafecoin !== undefined) {
          this.userData.cafecoin = usuario.cafecoin;
          console.log('Cafecoins actualizados:', this.userData.cafecoin);
        } else {
          console.error('Cafecoins no encontrados en la respuesta:', usuario);
        }
        this.changeDetector.detectChanges(); // Notifica al componente que se han hecho cambios
      },
      (error) => {
        console.error('Error al actualizar los datos del usuario:', error);
      }
    );
  }
  


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
  loadUserData(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('Usuario no autenticado.');
      return;
    }
  
    this.userRole = currentUser.roles ? currentUser.roles[0] : '';
    if (this.userRole === 'shop') {
      this.loadShopData(currentUser._id);
    } else {
      this.userData = currentUser;
      console.log('Datos del usuario:', this.userData);
    }
  }
  
  loadShopData(shopId: string): void {
    this.storeService.getShopById(shopId).subscribe(
      (data) => {
        this.shopData = data;
        console.log('Datos de la tienda:', this.shopData);
        // Llama a populateShopLogos después de obtener los datos de la tienda
        this.populateShopLogos();
      },
      (error) => {
        console.error('Error al cargar los datos de la tienda:', error);
      }
    );
  }

  async populateShopLogos(): Promise<void> {
    if (!this.shopData || !this.shopData.logo) {
      console.error('No se encontraron datos de la tienda o logo.');
      return;
    }

    // Asumir que shopData.logo tiene los datos en un formato adecuado
    const mimeType = this.getMimeType(this.shopData.logo.format);
    const logoUrl = await this.convertBufferToDataUrl(this.shopData.logo.data, mimeType);

    this.shopLogos = [
      {
        name: this.shopData.name,
        logoUrl: logoUrl,
      }
    ];
    console.log('Logos de la tienda: ', this.shopLogos);
  }

  getMimeType(format: string): string {
    switch (format) {
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/png'; // Ajusta el tipo MIME según corresponda
    }
  }

  convertBufferToDataUrl(buffer: any, mimeType: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const arrayBuffer = new Uint8Array(buffer).buffer;
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject('Error al leer el archivo');
        reader.readAsDataURL(blob);
      } catch (error) {
        reject(error);
      }
    });
  }
}
