import { Component, OnInit } from '@angular/core';
import Typed from 'typed.js';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  showWelcomeOverlay = true; // Controla la visibilidad de la imagen de bienvenida
  private videos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('video');

  ngOnInit(): void {
    // Inicializar Typed.js
    const typed = new Typed('.typed', {
      strings: [
        '<i class="pasos"><img src="assets/images/ingreso.png" alt=""><br>1. Inicia sesión o regístrate si aún no lo has hecho.</i>',
        '<i class="pasos"><img src="assets/images/mapa.png" alt=""><br>2. Visualiza en el mapa las tiendas de café y selecciona a cuál llegar.</i>',
        '<i class="pasos"><img src="assets/images/disfruta.png" alt=""><br>3. Disfruta de las especialidades que ofrece la tienda.</i>',
        '<i class="pasos"><img src="assets/images/album.png" alt=""><br>4. Activa la estampilla en la tienda para completar el álbum.</i>',
        '<i class="pasos"><img src="assets/images/premio.png" alt=""><br>...Al Completar el album puedes ganar CoffeCoins y redimir premios.</i>'
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

  playVideos(): void {
    this.videos = document.querySelectorAll('video');
    this.videos.forEach((video) => {
      video.play().catch(error => {
        console.error('El video no pudo reproducirse automáticamente:', error);
      });
    });
  }

  onWelcomeClick(): void {
    // Ocultar el overlay y reproducir los videos cuando el usuario hace clic
    this.showWelcomeOverlay = false;
    this.playVideos();
  }
}
