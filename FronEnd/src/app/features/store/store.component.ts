import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../service/store.service';
import { StoreStatusService } from '../../service/store-status.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private storeService: StoreService, 
    private storeStatusService: StoreStatusService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.generateCode();
    this.codeEntries = this.storeService.getCodeEntries();
    this.isStoreOpen = this.storeStatusService.isStoreActivated();
  }

  generateCode() {
    this.codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('storeCode', this.codigo);
    console.log('Nuevo código generado:', this.codigo);
  }

  useCode() {
    this.storeService.incrementCodeEntries();
    this.codeEntries = this.storeService.getCodeEntries();
    this.generateCode();
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  confirmToggleStoreActivation() {
    const newStatus = !this.isStoreOpen;
    this.storeStatusService.setStoreActivation(newStatus);
    this.isStoreOpen = this.storeStatusService.isStoreActivated();
    this.showModal = false;

    if (this.isStoreOpen) {
      this.toastr.success('Abriste tu tienda en el mapa', 'Tienda Abierta');
    } else {
      this.toastr.success('Cerraste tu tienda en el mapa', 'Tienda Cerrada');
    }
  }
}