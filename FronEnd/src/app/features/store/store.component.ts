import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../service/store.service';
import { StoreStatusService } from '../../service/store-status.service';

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

  constructor(private storeService: StoreService, private storeStatusService: StoreStatusService) {}

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
    this.closeModal();
  }
}