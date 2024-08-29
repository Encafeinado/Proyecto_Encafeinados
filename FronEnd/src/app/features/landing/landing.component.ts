import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Typed from 'typed.js';

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
        this.initializeTypedJs(); // Inicializar Typed.js cuando todas las imágenes estén cargadas
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
      this.initializeTypedJs(); // Si no hay imágenes, inicializar Typed.js directamente
    }
  }

  initializeTypedJs(): void {
    new Typed('.typed', {
      strings: [
        '<i class="pasos"><br><img src="assets/images/ingreso.png" alt=""><br><br>1. Inicia sesión o regístrate si aún no lo has hecho.</i>',
        '<i class="pasos"><br><img src="assets/images/mapa.png" alt=""><br><br>2. Visualiza en el mapa las tiendas de café y selecciona a cuál llegar.</i>',
        '<i class="pasos"><br><img src="assets/images/disfruta.png" alt=""><br><br>3. Disfruta de las especialidades que ofrece la tienda.</i>',
        '<i class="pasos"><br><img src="assets/images/album.png" alt=""><br><br>4. Activa la estampilla en la tienda para completar el álbum.</i>',
        '<i class="pasos"><br><img src="assets/images/premio.png" alt=""><br><br>...Al Completar el álbum puedes ganar CoffeCoins y redimir premios.</i>'
      ],
      typeSpeed: 20,
      startDelay: 300,
      backSpeed: 10,
      smartBackspace: true,
      shuffle: false,
      backDelay: 1500,
      loop: true,
      loopCount: Infinity,
      showCursor: true,
      cursorChar: '|',
      contentType: 'html',
    });
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
