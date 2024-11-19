import { Component, OnInit } from '@angular/core';
import { ShopService } from 'src/app/service/shop.service';
declare var bootstrap: any;

@Component({
  selector: 'app-landing',
  templateUrl: './landing-tienda.component.html',
  styleUrls: ['./landing-tienda.component.css']
})
export class LandingTiendaComponent implements OnInit {
  shopLogos: { name: string; logoUrl: string }[] = [];
  shopData: any[] = [];

  constructor(private shopService: ShopService) {}

  ngOnInit(): void {
    this.fetchShopData();
  }

  ngAfterViewInit(): void {
    const carouselElement = document.getElementById('coffeeCarousel');
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 3000, // Cambia cada 3 segundos
        ride: 'carousel',
      });
    }
  }

  fetchShopData(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado en el almacenamiento local.');
      return;
    }
  
    this.shopService.fetchShopData(token).subscribe(
      (data: any[]) => {
        console.log('Datos recibidos:', data); // Agrega esto para verificar los datos
        this.shopData = data;
        this.populateShopLogos();
      },
      error => {
        console.error('Error al obtener los datos de la tienda:', error);
      }
    );
  }
  
  async populateShopLogos(): Promise<void> {
    this.shopLogos = await Promise.all(
      this.shopData.map(async (shop: any) => {
        const mimeType = this.getMimeType(shop.logo.format);
        const logoUrl = await this.convertBufferToDataUrl(shop.logo, mimeType);
        return {
          name: shop.name,
          logoUrl: logoUrl,
        };
      })
    );
    // console.log('Logos de la tienda: ', this.shopLogos);
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
        return 'image/png'; // Ajusta según tus necesidades
    }
  }

  
  convertBufferToDataUrl(buffer: any, mimeType: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const arrayBuffer = new Uint8Array(buffer.data).buffer;
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

  get totalStamps(): number {
    // La cantidad total de estampas es igual a la cantidad total de tiendas
    if (!this.shopData) {
      return 0;
    }

    return this.shopData.length;
  }

  
}
