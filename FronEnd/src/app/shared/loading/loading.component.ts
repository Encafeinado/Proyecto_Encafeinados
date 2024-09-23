import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements AfterViewInit {
  
  // Usamos ViewChild para obtener una referencia al div del loader
  @ViewChild('smokeLoader') smokeLoader!: ElementRef;

  constructor() { }

  // ngAfterViewInit asegura que el DOM esté completamente cargado
  ngAfterViewInit(): void {
    this.showLoader();
  }

  showLoader(): void {
    // Mantiene el loader visible durante 5 segundos y luego lo oculta
    setTimeout(() => {
      if (this.smokeLoader) {
        this.smokeLoader.nativeElement.style.opacity = '0';
        this.smokeLoader.nativeElement.style.visibility = 'hidden';
      }
    }, 5000); // Esperar 5 segundos
  }
}
