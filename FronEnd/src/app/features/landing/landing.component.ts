import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Typed from 'typed.js';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChild('video', { static: true }) video?: ElementRef<HTMLVideoElement>; // Propiedad opcional
  @ViewChild('video1', { static: true }) video1?: ElementRef<HTMLVideoElement>; // Propiedad opcional
  @ViewChild('video2', { static: true }) video2?: ElementRef<HTMLVideoElement>; // Propiedad opcional
  showWelcomeOverlay = true; // Controla la visibilidad de la imagen de bienvenida

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

  ngAfterViewInit(): void {
    // Configurar todos los videos para que estén en silencio después de la vista
    if (this.video) {
      this.video.nativeElement.muted = true;
    }
    if (this.video1) {
      this.video1.nativeElement.muted = true;
    }
    if (this.video2) {
      this.video2.nativeElement.muted = true;
    }
  }
}
