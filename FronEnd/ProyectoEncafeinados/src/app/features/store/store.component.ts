import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  codigo: string = '';

  constructor() {}

  ngOnInit() {
    this.generateCode();
  }

  generateCode() {
    this.codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('storeCode', this.codigo); // Guardar el código en el almacenamiento local
  }
}
