// store.component.ts
import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../service/store.service';
import { StoreStatusService } from '../../service/store-status.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Shop } from './interfaces/shop.interface';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  codigo: string = '';
  codeEntries: number = 0;
  isStoreOpen: boolean = false;
  showModal: boolean = false;
  shopId: string = '';

  constructor(
    private storeService: StoreService, 
    private storeStatusService: StoreStatusService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.shopId = this.authService.getShopId() || '';
    if (this.shopId) {
      this.getShopInfo();
    }
    this.isStoreOpen = this.storeStatusService.isStoreActivated();
  }

  getShopInfo() {
    this.storeService.getShopById(this.shopId).subscribe(
      (shop: Shop) => {
        console.log('Shop info:', shop);
        this.codigo = shop.verificationCode;
        this.codeEntries = shop.codeUsage;
        this.isStoreOpen = shop.statusShop; // Actualiza el estado de la tienda
      },
      (error) => {
        console.error('Error fetching shop info:', error);
      }
    );
  }

  generateCode() {
    this.codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('storeCode', this.codigo);
    console.log('Nuevo código generado:', this.codigo);
  }

  useCode() {
    this.storeService.verifyCode(this.shopId, this.codigo).subscribe(response => {
      this.getShopInfo(); // Actualiza la información de la tienda después de usar el código
      this.toastr.success(response.message);
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  confirmToggleStoreActivation() {
    const newStatus = !this.isStoreOpen;
    this.storeService.updateShopStatus(this.shopId, newStatus).subscribe({
      next: (shop: Shop) => {
        this.isStoreOpen = newStatus; // Actualiza el estado en la vista
        this.storeStatusService.setStoreActivation(newStatus); // Actualiza el estado en el servicio
        this.showModal = false;

        console.log('Estado de la tienda actualizado:', newStatus ? 'Abierta' : 'Cerrada');
        console.log('Información de la tienda actualizada:', shop);

        if (this.isStoreOpen) {
          this.toastr.success('Abriste tu tienda en el mapa', 'Tienda Abierta');
        } else {
          this.toastr.success('Cerraste tu tienda en el mapa', 'Tienda Cerrada');
        }
      },
      error: (err) => {
        console.error('Error al actualizar el estado de la tienda:', err);
        this.toastr.error('Error al actualizar el estado de la tienda', 'Error');
      }
    });
  }
}