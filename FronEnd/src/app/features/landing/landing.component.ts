import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
// import Typed from 'typed.js';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChild('video', { static: true }) video?: ElementRef<HTMLVideoElement>;
  @ViewChild('video1', { static: true }) video1?: ElementRef<HTMLVideoElement>;
  @ViewChild('video2', { static: true }) video2?: ElementRef<HTMLVideoElement>;
  showWelcomeOverlay = true;

  ngOnInit(): void {
    // Asegúrate de que las imágenes estén completamente cargadas antes de inicializar Typed.js
    const images = Array.from(document.querySelectorAll('.pasos img')) as HTMLImageElement[];
    let loadedImages = 0;

    const checkIfAllImagesLoaded = () => {
      loadedImages++;
      if (loadedImages === images.length) {
        // this.initializeTypedJs(); // Inicializar Typed.js cuando todas las imágenes estén cargadas
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkIfAllImagesLoaded();
      } else {
        img.addEventListener('load', checkIfAllImagesLoaded);
        img.addEventListener('error', checkIfAllImagesLoaded); // Asegura que el conteo también se actualice si hay un error en la carga de imagen
      }
    });

    if (images.length === 0) {
      // this.initializeTypedJs(); // Si no hay imágenes, inicializar Typed.js directamente
    }
  }


  ngAfterViewInit(): void {
    // Configurar todos los videos para que estén en silencio después de la vista
    const videos = [this.video, this.video1, this.video2];
    videos.forEach(video => {
      if (video?.nativeElement) {
        video.nativeElement.muted = true;
      }
    });
  }
}
