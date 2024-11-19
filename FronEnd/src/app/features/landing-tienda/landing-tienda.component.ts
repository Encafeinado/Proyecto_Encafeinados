import { Component, OnInit } from '@angular/core';
import { ShopService } from 'src/app/service/shop.service';

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

  fetchShopData(): void {
    this.shopService.fetchShopData2().subscribe(
      (data: any[]) => {
        console.log('Datos recibidos:', data); // Verificar los datos recibidos
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
