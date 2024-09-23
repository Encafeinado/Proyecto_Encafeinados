import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as toastr from 'toastr';
import { AlbumService, Image } from '../../service/album.service';
import { UserService } from '../../service/user.service';
import { StoreService } from '../../service/store.service';
import { ShopService } from '../../service/shop.service';
import { ReviewService } from '../../service/reviews.service';

import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, OnDestroy {
  modalRef!: NgbModalRef;
  reviewApp: string = '';
  openedModal = false;
  modalAbierto = false; // Flag para verificar si el modal ya ha sido mostrado
  verifiedcode: boolean = false;
  destinationName!: string;
  specialties1!: string;
  specialties2!: string;
  shopStatus!: string;
  enteredCode: string = '';
  verified: boolean = false;
  message: string = '';
  userData: any;
  shopData: any[] = [];
  hasArrived: boolean = false; // Nuevo estado para verificar si ya ha llegado
  shopLogos: { name: string; logoUrl: string }[] = [];
  shopMarkers: any[] = []; // Asegúrate de inicializar shopMarkers
  circleOverlays: { overlay: any; markerData: any }[] = [];
  userId: string | null = null;
  bookImages: Image[] = [];
  obtainedStamps: number = 0;
  enteredRating: number = 0;
  enteredReview: string = '';
  showAlert: boolean = false;
  isButtonDisabled: boolean = true;
  markerUsuario?: google.maps.Marker;
  google: any = window.google;
  modoTransporte: google.maps.TravelMode = google.maps.TravelMode.DRIVING;
  center: google.maps.LatLngLiteral = {
    lat: 6.150155571503784,
    lng: -75.61905204382627,
  };
  zoom = 15;
  currentImageUrl!: string;
  rutaActiva: boolean = false;
  routeDetails: string | undefined;
  markerPosition: google.maps.LatLngLiteral | undefined;
  directionsResult: google.maps.DirectionsResult | null = null;
  ultimaPosicion: google.maps.LatLngLiteral | null = null; // Para almacenar la última posición
  watchId: number | undefined;
  instruccionesRuta: string[] = []; // Lista completa de instrucciones
  instruccionesActuales: string[] = []; // Instrucciones que se mostrarán de a 2
  currentInstructionIndex: number = 0;
  private directionsService: google.maps.DirectionsService =
    new google.maps.DirectionsService();
  private directionsRendererInstance: google.maps.DirectionsRenderer =
    new google.maps.DirectionsRenderer();
  distanceMatrixService: google.maps.DistanceMatrixService =
    new google.maps.DistanceMatrixService();
  private hasZoomed: boolean = false;

  opcionesMapa: google.maps.MapOptions = {
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }],
      },
    ],
    streetViewControl: false, // Elimina el control de Street View
    mapTypeControl: false, // Elimina el botón de "Mapa/Satélite"
    fullscreenControl: false, // Elimina el botón de pantalla completa
    zoomControl: false, // Elimina el control de zoom
    rotateControl: true, // Habilita el control de rotación
    tilt: 45, // Activa la inclinación del mapa
    gestureHandling: 'greedy', // Permite rotar y hacer zoom con gestos (como en móviles)
  };
  iconoUbicacionUsuario = {
    url: 'assets/IconsMarker/cafeino.png', // Ruta desde la raíz pública
    scaledSize: new google.maps.Size(50, 50),
    rotation: 0,
  };
  iconoTienda = {
    url: 'assets/IconsMarker/cafeteriaAroma.png', // Ruta desde la raíz pública
    scaledSize: new google.maps.Size(40, 40),
    rotation: 0,
  };
  @ViewChild('createModal', { static: true }) createModal: any;
  @ViewChild('cancelModal', { static: true }) cancelModal: any;
  @ViewChild('codeModal', { static: true }) codeModal: any;
  @ViewChild('modalBook', { static: true }) modalBook: any;
  @ViewChild('codeInput', { static: false }) codeInput!: ElementRef;
  @ViewChild('arriveModal', { static: true }) arriveModal: any;
  @ViewChild('modalReviewShop', { static: true }) modalReviewShop: any;

  constructor(
    private modalService: NgbModal,
    private albumService: AlbumService,
    private userService: UserService,
    private storeService: StoreService,
    private shopService: ShopService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private changeDetector: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.rastrearUbicacionUsuario();
    this.fetchUserData();
    this.fetchShopData();
    this.populateShopLogos();
    this.fetchBookData();
    this.userId = this.authService.getUserId(); // Obtener el ID del usuario
    document.body.addEventListener(
      'touchstart',
      this.solicitarPermisoOrientacion.bind(this),
      { once: true }
    );
    document.body.addEventListener(
      'click',
      this.solicitarPermisoOrientacion.bind(this),
      { once: true }
    );

    if (this.userId) {
      this.fetchBookData();
    } else {
      console.error('No se encontró el ID del usuario.');
    }
    this.changeDetector.detectChanges();

    // Actualiza los datos cada 10 segundos (10000 ms)
    setInterval(() => {
      // this.fetchShopData();
      this.actualizarEstadosTiendas();
      this.fetchBookData();
    }, 10000); // 10 segundos
  }

  ngOnDestroy() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  iniciarMapa() {
    class CircleOverlay extends google.maps.OverlayView {
      private position: google.maps.LatLng;
      private div: HTMLDivElement;
      private map: google.maps.Map;

      constructor(
        position: google.maps.LatLng,
        map: google.maps.Map,
        status: boolean
      ) {
        super();
        this.position = position;
        this.map = map;
        this.div = document.createElement('div');

        // Estilos de la bolita
        this.div.style.borderRadius = '50%';
        this.div.style.backgroundColor = status ? 'green' : 'red';
        this.div.style.width = '10px';
        this.div.style.height = '10px';

        // Contorno blanco (borde)
        this.div.style.border = '1.8px solid white'; // Borde blanco de 1.8px

        // Posicionamiento y transformación
        this.div.style.position = 'absolute';
        this.div.style.transform = 'translate(70%, -458%)';

        this.setMap(map);
      }

      updateStatus(status: boolean) {
        this.div.style.backgroundColor = status ? 'green' : 'red';
      }

      override onAdd() {
        const panes = this.getPanes();
        if (panes && panes.overlayMouseTarget) {
          panes.overlayMouseTarget.appendChild(this.div);
        } else {
          console.error(
            'No se pudieron obtener los panes para el OverlayView.'
          );
        }
      }

      override draw() {
        const projection = this.getProjection();
        if (projection) {
          const position = projection.fromLatLngToDivPixel(this.position);
          if (position) {
            this.div.style.left = `${position.x}px`;
            this.div.style.top = `${position.y}px`;
          }
        }
      }

      override onRemove() {
        if (this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
      }
    }

    // Utilizar la propiedad `circleOverlays` de la clase
    this.shopMarkers = this.shopData.map((shop: any) => ({
      position: {
        lat: shop.latitude,
        lng: shop.longitude,
      },
      title: shop.name,
      status: shop.statusShop,
      specialties1: shop.specialties1,
      specialties2: shop.specialties2,
      imageUrl: this.getShopImageUrl(shop.name),
    }));

    const mapElement = document.getElementById('map') as HTMLElement;
    if (mapElement) {
      const map = new google.maps.Map(mapElement, {
        center: this.center,
        zoom: this.zoom,
        ...this.opcionesMapa,
      });

      this.directionsRendererInstance.setMap(map);

      if (this.markerPosition) {
        this.markerUsuario = new google.maps.Marker({
          position: this.markerPosition,
          map: map,
          icon: this.iconoUbicacionUsuario,
        });
      } else {
        console.error('markerPosition no está definido.');
      }

      this.shopMarkers.forEach((markerData) => {
        if (markerData.position) {
          const marker = new google.maps.Marker({
            position: markerData.position,
            map: map,
            icon: this.iconoTienda,
            title: markerData.title,
          });

          const overlay = new CircleOverlay(
            marker.getPosition()!,
            map,
            markerData.status
          );
          this.circleOverlays.push({
            overlay: overlay,
            markerData: markerData,
          });

          marker.addListener('click', () => {
            this.openModal(
              this.createModal,
              markerData.title,
              markerData.status,
              markerData.specialties1,
              markerData.specialties2,
              markerData.imageUrl
            );
          });
        } else {
          console.error('Posición del marcador de la tienda no está definida.');
        }
      });

      google.maps.event.trigger(map, 'resize');

      // Actualización periódica de los estados
      setInterval(() => {
        this.actualizarEstadosTiendas();
        // console.log('Actualizado los estados');
      }, 10000);
    } else {
      console.error('Elemento del mapa no encontrado.');
    }
  }

  getShopImageUrl(destinationName: string): string {
    switch (destinationName.toLowerCase()) {
      case 'vibrante café':
        return 'assets/images/ruta-vibrante.jpg';
      case 'aroma café sabaneta':
        return 'assets/images/ruta-aroma.jpg';
      case 'saudade':
        return 'assets/images/ruta-saudade.jpg';
      case 'milagro coffee shop':
        return 'assets/images/ruta-milagro.jpg';
      default:
        return 'assets/images/default-image.jpg'; // Imagen por defecto si no coincide el nombre
    }
  }

  // Método para actualizar los estados de las tiendas
  actualizarEstadosTiendas(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado en el almacenamiento local.');
      return;
    }

    this.shopService.fetchShopData(token).subscribe(
      (data: any) => {
        // Solo actualizar los estados de las tiendas
        this.shopData.forEach((shop: any) => {
          const tiendaActualizada = data.find((d: any) => d.name === shop.name);
          if (tiendaActualizada) {
            shop.statusShop = tiendaActualizada.statusShop;
            // console.log('Holaaaa1');
          }
        });

        // Actualiza los estados en las bolitas
        this.circleOverlays.forEach((overlayData) => {
          const shop = this.shopData.find(
            (s) => s.name === overlayData.markerData.title
          );
          if (shop) {
            overlayData.overlay.updateStatus(shop.statusShop);
            // console.log('Holaaaa');
          }
        });
      },
      (error) => {
        console.error('Error al actualizar los estados de las tiendas:', error);
      }
    );
  }

  interpolarPosicion(
    posicionInicial: google.maps.LatLngLiteral,
    posicionFinal: google.maps.LatLngLiteral,
    factor: number
  ): google.maps.LatLngLiteral {
    return {
      lat:
        posicionInicial.lat +
        (posicionFinal.lat - posicionInicial.lat) * factor,
      lng:
        posicionInicial.lng +
        (posicionFinal.lng - posicionInicial.lng) * factor,
    };
  }

  rastrearUbicacionUsuario() {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Verificar si el modal está abierto; si lo está, detener el seguimiento de la ubicación
          if (this.modalAbierto && this.rutaActiva) {
            console.log('El modal está abierto, se detiene el cálculo de la ubicación.');
            if (this.watchId !== undefined) {
              navigator.geolocation.clearWatch(this.watchId); // Solo limpiar si watchId tiene valor
            }
            return; // Salir de la función y evitar recalcular mientras el modal esté abierto
          }
  
          const nuevaPosicion = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
  
          // Si ya tienes una posición previa, realiza la interpolación
          if (this.markerPosition) {
            const pasos = 10; // Cuantos más pasos, más suave será la transición
            const duracion = 1000; // Tiempo total de la interpolación en milisegundos
            const intervalo = duracion / pasos;
            let pasoActual = 0;
  
            const intervaloId = setInterval(() => {
              pasoActual++;
              const factor = pasoActual / pasos;
              const posicionInterpolada = this.interpolarPosicion(
                this.markerPosition!,
                nuevaPosicion,
                factor
              );
  
              // Actualiza la posición del marcador en el mapa
              this.markerUsuario?.setPosition(posicionInterpolada);
  
              this.verificarAvanceInstrucciones();
              if (pasoActual >= pasos) {
                clearInterval(intervaloId);
                this.markerPosition = nuevaPosicion;
  
                // Verificar cercanía al destino solo si el modal no está abierto
                if (!this.modalAbierto) {
                  this.verificarCercaniaADestino();
                }
  
                // Actualización de la ruta si está activa
                if (this.rutaActiva) {
                  const map = this.directionsRendererInstance.getMap();
                  if (map) {
                    map.panTo(this.markerPosition);
                    if (this.debeRecalcularRuta(this.markerPosition)) {
                      this.calcularRuta(); // Recalcular la ruta
                    }
                  }
                }
              }
            }, intervalo);
          } else {
            // Si es la primera vez que obtienes la posición
            this.markerPosition = nuevaPosicion;
            this.markerUsuario?.setPosition(this.markerPosition);
            
            // Verificar cercanía al destino solo si el modal no está abierto
            if (!this.modalAbierto) {
              this.verificarCercaniaADestino();
            }
          }
  
          if (!this.hasZoomed) {
            const map = this.directionsRendererInstance.getMap();
            if (map) {
              map.setZoom(17); // Zoom inicial en la ubicación del usuario
              map.panTo(this.markerPosition);
              this.hasZoomed = true; // Evitar futuros zooms automáticos
              this.solicitarPermisoOrientacion();
            }
          }
  
          console.log('Ubicación del usuario actualizada:', this.markerPosition);
          this.actualizarMarcadorUbicacionUsuario();
  
          // Actualizar detalles de la ruta si la ruta está activa
          if (this.rutaActiva && this.directionsResult) {
            this.obtenerDetallesRuta(this.directionsResult);
          }
        },
        (error) => {
          console.error('Error rastreando la ubicación', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.error('Geolocalización no es soportada por este navegador.');
    }
  }

  // Método para calcular la distancia entre dos puntos (en metros)
  calcularDistancia(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const origen = new google.maps.LatLng(lat1, lng1);
    const destino = new google.maps.LatLng(lat2, lng2);
  
    const distancia = google.maps.geometry.spherical.computeDistanceBetween(
      origen,
      destino
    );
  
    return distancia; // Devuelve la distancia en metros
  }  

  // Método para obtener la distancia entre el marcador y el destino usando Google Maps Directions API
  obtenerDistanciaConDirecciones(
    origen: google.maps.LatLngLiteral,
    destino: google.maps.LatLngLiteral
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const directionsService = new google.maps.DirectionsService();

      const request: google.maps.DirectionsRequest = {
        origin: origen,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result, status) => {
        // Verificar que el resultado y las propiedades necesarias no sean undefined
        if (
          status === google.maps.DirectionsStatus.OK &&
          result?.routes?.[0]?.legs?.[0]?.distance?.value
        ) {
          const distancia = result.routes[0].legs[0].distance.value; // Distancia en metros
          resolve(distancia);
        } else {
          reject('No se pudo obtener la distancia');
        }
      });
    });
  }

  verificarCercaniaADestino() {
    if (
      this.markerPosition &&
      this.destinationName &&
      this.rutaActiva &&
      !this.hasArrived
    ) {
      console.log('Verificando cercanía al destino...', this.destinationName);

      if (
        typeof this.destinationName === 'object' &&
        'lat' in this.destinationName &&
        'lng' in this.destinationName
      ) {
        const lat2 = (this.destinationName as { lat: number; lng: number }).lat;
        const lng2 = (this.destinationName as { lat: number; lng: number }).lng;

        // Calcula la distancia y verifica cercanía
        this.procesarVerificacionCercania(lat2, lng2);
      } else {
        // Si no hay coordenadas, usa el nombre del destino para obtenerlas
        this.obtenerCoordenadasDestino(this.destinationName)
          .then((coords) => {
            console.log('Coordenadas obtenidas del destino:', coords);
            this.procesarVerificacionCercania(coords.lat, coords.lng);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      console.error(
        'Posición del marcador, destino o ruta no definidos, o ya se ha llegado.'
      );
    }
  }

  procesarVerificacionCercania(lat2: number, lng2: number) {
    if (!this.markerPosition) {
      console.error('Posición del marcador no está definida.');
      return;
    }
  
    const distancia = this.calcularDistancia(
      this.markerPosition.lat,
      this.markerPosition.lng,
      lat2,
      lng2
    );
  
    console.log(`Distancia calculada: ${distancia} metros`);
  
    // Verificar si hay ruta activa antes de abrir el modal
    if (distancia < 45 && !this.modalAbierto && this.rutaActiva) {
      console.log('Abriendo modal de llegada...');
      this.openModal(this.arriveModal, this.destinationName, '', '', '', '');
      this.modalAbierto = true; // Marcar que el modal ha sido mostrado
    }
  
    if (this.modalAbierto) {
      console.log(`El modal ya está abierto. Distancia actual: ${distancia} metros`);
    } else {
      console.log(`Aún no cerca del destino. Distancia actual: ${distancia} metros`);
    }
  }
  

  // Método para obtener las coordenadas del destino utilizando Google Maps Geocoding API
  obtenerCoordenadasDestino(
    destino: string
  ): Promise<google.maps.LatLngLiteral> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address: destino }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const coordinates: google.maps.LatLngLiteral = {
            lat: location.lat(),
            lng: location.lng(),
          };
          resolve(coordinates);
        } else {
          reject('No se pudieron obtener las coordenadas del destino');
        }
      });
    });
  }

  // Método para determinar si la ruta debe ser recalculada
  debeRecalcularRuta(nuevaPosicion: google.maps.LatLngLiteral): boolean {
    // Implementa una lógica para determinar si la ruta debe ser recalculada
    // Por ejemplo, podrías comparar con la última posición conocida y verificar si ha cambiado significativamente
    return true; // Cambia esto según tu lógica
  }

  // Método para actualizar la ubicación del marcador cuando se hace clic en el botón
  actualizarMarcadorUbicacionUsuario() {
    if (this.markerPosition) {
      const map = this.directionsRendererInstance.getMap();
      if (map) {
        if (!this.markerUsuario) {
          // Inicializar el marcador con el ícono del usuario
          this.markerUsuario = new google.maps.Marker({
            position: this.markerPosition,
            map: map,
            icon: this.iconoUbicacionUsuario,
          });
        } else {
          this.markerUsuario.setPosition(this.markerPosition);
        }

        // Solo ajustar el mapa si hay una ruta activa
        if (this.rutaActiva) {
          map.setZoom(17); // Ajusta el nivel de zoom
          map.panTo(this.markerPosition);
        }
      }
    } else {
      console.error(
        'markerPosition no está definido en actualizarMarcadorUbicacionUsuario.'
      );
    }
  }

  centerOnUserLocation(clickTriggered: boolean = false) {
    if (this.markerPosition) {
      const map = this.directionsRendererInstance.getMap();
      if (map) {
        // Centra el mapa en la posición del marcador del usuario
        map.panTo(this.markerPosition);

        // Si se activó por el clic del botón, ajusta el zoom
        if (clickTriggered || this.rutaActiva) {
          setTimeout(() => {
            map.setZoom(18); // Ajusta el nivel de zoom según sea necesario
          }, 300);
        }
      }
    } else {
      console.error('La ubicación del usuario no está disponible.');
    }
  }

  solicitarPermisoOrientacion() {
    const deviceOrientationEvent = DeviceOrientationEvent as any;

    if (typeof deviceOrientationEvent.requestPermission === 'function') {
      deviceOrientationEvent
        .requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            this.iniciarOrientacionDispositivo();
          } else {
            console.error('Permiso de orientación denegado.');
          }
        })
        .catch((error: any) => {
          console.error('Error solicitando permiso de orientación:', error);
        });
    } else {
      this.iniciarOrientacionDispositivo();
    }
  }

  iniciarOrientacionDispositivo() {
    window.addEventListener(
      'deviceorientation',
      (event) => {
        if (event.alpha !== null) {
          const heading = this.calcularHeading(event);
          if (heading !== null) {
            this.actualizarRotacionMarcador(heading);
          } else {
            console.error(
              'No se pudo obtener una orientación válida del dispositivo.'
            );
          }
        }
      },
      true
    );
  }

  calcularHeading(event: DeviceOrientationEvent): number | null {
    if (event.alpha === null || event.beta === null || event.gamma === null) {
      return null;
    }

    // Detecta si el dispositivo es iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Detecta la orientación del dispositivo (por si la pantalla está en modo horizontal)
    const orientacion = window.screen.orientation?.angle || 0;

    // Ajusta el heading basado en los ejes del dispositivo
    let heading = event.alpha; // Alpha determina el heading (norte-sur)

    if (isIOS) {
      // En iOS, el eje "alpha" está invertido
      heading = 360 - heading;

      // Ajuste cuando el dispositivo está en modo horizontal (pantalla rotada) en iOS
      if (orientacion === 90) {
        heading = (heading + 270) % 360; // Rotación a la derecha
      } else if (orientacion === -90) {
        heading = (heading + 90) % 360; // Rotación a la izquierda
      }
    } else {
      // Ajustes para Android
      if (orientacion === 90) {
        heading = (heading + 90) % 360; // Rotación a la derecha en Android
      } else if (orientacion === -90) {
        heading = (heading + 270) % 360; // Rotación a la izquierda en Android
      }
    }

    // Aplica la orientación del dispositivo en ambos sistemas
    heading = (heading + orientacion + 360) % 360;

    return heading;
  }

  actualizarRotacionMarcador(
    heading: number,
    result?: google.maps.DirectionsResult
  ) {
    const map = this.directionsRendererInstance.getMap();
    if (!map) {
      console.error('El mapa no está definido.');
      return;
    }

    // Definir el icono basado en si la ruta está activa o no
    const iconoRotado = this.rutaActiva
      ? {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4,
          rotation: heading,
          fillColor: 'blue',
          fillOpacity: 0.8,
          strokeWeight: 2,
          anchor: new google.maps.Point(0, 2.6),
        }
      : {
          url: this.iconoUbicacionUsuario.url,
          rotation: heading,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(25, 25),
        };

    if (this.markerUsuario) {
      this.markerUsuario.setIcon(iconoRotado);
    } else {
      console.error('El marcador del usuario no está definido.');
    }

    if (result) {
      const route = result.routes[0];
      const legs = route.legs;
      const step = legs[0].steps[0];

      if (step) {
        const position = step.start_location;

        if (this.markerUsuario) {
          this.markerUsuario.setPosition(position);
          this.markerUsuario.setIcon({
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 4,
            rotation: heading,
            fillColor: 'blue',
            fillOpacity: 0.8,
            strokeWeight: 2,
          });
        } else {
          this.markerUsuario = new google.maps.Marker({
            position: position,
            map: map,
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 4,
              rotation: heading,
              fillColor: 'blue',
              fillOpacity: 0.8,
              strokeWeight: 2,
            },
          });
        }
      } else {
        console.error('No se pudo obtener el primer paso de la ruta.');
      }
    }
  }

  seleccionarModoTransporte(modo: google.maps.TravelMode) {
    this.modoTransporte = modo;
  }

  // Método para calcular la ruta
  calcularRuta() {
    // Verificar si el modal está abierto, si lo está, no recalcular la ruta
    if (this.modalAbierto) {
      console.log('El modal está abierto, no se recalcula la ruta.');
      return;
    }
  
    if (!this.modoTransporte) {
      this.toastr.warning(
        'Por favor, selecciona un modo de transporte.',
        'Advertencia'
      );
      return;
    }
  
    if (!this.markerPosition) {
      console.error('La posición del marcador no está definida.');
      return;
    }
  
    if (!this.destinationName) {
      console.error('El destino no está definido.');
      return;
    }
  
    let destination: google.maps.LatLngLiteral | string;
  
    if (
      typeof this.destinationName === 'object' &&
      'lat' in this.destinationName &&
      'lng' in this.destinationName
    ) {
      destination = this.destinationName as google.maps.LatLngLiteral;
    } else if (typeof this.destinationName === 'string') {
      destination = this.destinationName;
    } else {
      console.error('El destino proporcionado no es válido.');
      return;
    }
  
    const travelMode = this.modoTransporte ?? google.maps.TravelMode.DRIVING;
  
    const request: google.maps.DirectionsRequest = {
      origin: this.markerPosition,
      destination: destination,
      travelMode: travelMode,
      unitSystem: google.maps.UnitSystem.METRIC,
    };
  
    this.directionsRendererInstance.setOptions({
      suppressMarkers: true,
      preserveViewport: true,
    });
  
    this.directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        this.directionsResult = result; // Almacena el resultado aquí
        this.directionsRendererInstance.setDirections(result);
        this.obtenerDetallesRuta(result);
        this.rutaActiva = true;
        this.centrarMapaEnMarcador();
  
        if (this.modalRef) {
          this.modalRef.close();
        }
        this.actualizarRotacionMarcador(0, result); // Actualiza la rotación y la flecha
  
        if (this.rutaActiva && this.markerPosition) {
          this.verificarCercaniaADestino();
        }
      } else {
        this.rutaActiva = false;
        console.error('Error al calcular la ruta:', status, result);
        this.toastr.warning(
          'La ruta en este medio de transporte no está disponible',
          'Advertencia'
        );
      }
    });
  }

  centrarMapaEnMarcador() {
    const map = this.directionsRendererInstance.getMap();
    if (map) {
      if (this.markerPosition) {
        // Ajusta el nivel de zoom y centra el mapa en el marcador del usuario
        map.setZoom(17); // Ajusta el nivel de zoom a 17 o cualquier valor que prefieras
        map.panTo(this.markerPosition);
        this.hasZoomed = true; // Evita que el zoom cambie más adelante
      } else {
        console.error('La posición del marcador no está definida.');
      }
    } else {
      console.error('El mapa no está definido.');
    }
  }

  // Guardar las instrucciones iniciales de la ruta
  obtenerDetallesRuta(result: google.maps.DirectionsResult) {
    if (result.routes.length > 0) {
      const route = result.routes[0];
      if (route.legs.length > 0) {
        const leg = route.legs[0];

        // Aquí obtienes la distancia, duración y el nombre del destino
        const distance = leg.distance?.value || 0;
        const duration = leg.duration?.text || 'Duración no disponible';
        const destination = leg.end_address || 'Destino no disponible';

        // Almacenar los detalles de la ruta
        this.routeDetails = `Distancia: ${distance} metros, Tiempo estimado: ${duration}, Destino: ${destination}`;
        console.log(this.routeDetails);

        // Limpiar y resetear las instrucciones
        this.instruccionesRuta = [];
        this.currentInstructionIndex = 0;

        // Guardar todas las instrucciones de la ruta
        leg.steps.forEach((step) => {
          this.instruccionesRuta.push(step.instructions);
        });

        // Mostrar las primeras 2 instrucciones
        this.mostrarInstrucciones();
      }
    }
  }

  // Método para mostrar siempre 2 instrucciones
  mostrarInstrucciones() {
    // Mostrar solo dos instrucciones a la vez
    const nextInstructions = this.instruccionesRuta.slice(
      this.currentInstructionIndex,
      this.currentInstructionIndex + 1
    );

    console.log('Instrucciones actuales:', nextInstructions);

    // Actualizar la vista con las instrucciones actuales
    this.instruccionesActuales = nextInstructions;
  }

  // Avanzar en las instrucciones de a 2
  avanzarInstrucciones() {
    if (this.currentInstructionIndex < this.instruccionesRuta.length - 1) {
      this.currentInstructionIndex += 1;
      this.mostrarInstrucciones();
    }
  }

  // Método para verificar si el usuario ha avanzado más de 50 metros
  verificarAvanceInstrucciones() {
    if (this.markerPosition && this.ultimaPosicion) {
      const distanciaRecorrida = this.calcularDistancia(
        this.markerPosition.lat,
        this.markerPosition.lng,
        this.ultimaPosicion.lat,
        this.ultimaPosicion.lng
      );

      // Si la distancia recorrida supera el umbral de 50 metros, avanzamos a la siguiente instrucción
      if (distanciaRecorrida >= 20) {
        if (this.currentInstructionIndex < this.instruccionesRuta.length - 1) {
          this.avanzarInstrucciones();
        }
        // Actualizamos la última posición para futuras comparaciones
        this.ultimaPosicion = this.markerPosition;
      }
    } else {
      // Si es la primera vez que se llama, inicializamos ultimaPosicion
      this.ultimaPosicion = this.markerPosition || null;
    }
  }

  openModalCancelRuta(): void {
    this.openModal(this.cancelModal, '', '', '', '', '');
  }

  confirmarRutaCancelada() {
    this.cancelarRuta(); // Llama al método para cancelar la ruta
    this.modalRef.close();
  }

  cancelarRuta() {
    if (this.directionsRendererInstance) {
      this.directionsRendererInstance.setMap(null); // Elimina el renderer del mapa
      this.directionsRendererInstance = new google.maps.DirectionsRenderer(); // Re-inicializa el renderizador
      this.rutaActiva = false; // Marca que la ruta ya no está activa
      this.instruccionesRuta = []; // Limpia las instrucciones de la ruta
      this.routeDetails = undefined; // Limpia los detalles de la ruta

      // Vuelve a iniciar el mapa y mostrar los marcadores
      this.iniciarMapa();
      if (this.markerPosition) {
        const map = this.directionsRendererInstance.getMap();
        if (map) {
          // Centra el mapa en la posición del marcador del usuario
          map.panTo(this.markerPosition);

          setTimeout(() => {
            map.setZoom(17); // Ajusta el nivel de zoom según sea necesario
          }, 300);
        }
      }
      this.modalAbierto = false;
      console.log('Ruta cancelada, mapa actualizado y centrado en el usuario.');
    } else {
      console.error('No se encontró la instancia de DirectionsRenderer.');
    }
  }

  confirmarLlegada() {
    // Evitar que se confirme la llegada más de una vez si el proceso ya se completó
    if (this.hasArrived) {
      return; // Salir si ya se ha confirmado la llegada
    }

    // Marca que la llegada fue confirmada
    this.hasArrived = true;

    // Cancela la ruta actual y limpia el mapa
    this.cancelarRuta();

    // Cierra el modal de llegada si está abierto
    if (this.modalRef) {
      this.modalRef.close();
      this.openedModal = false; // Resetear el estado de openedModal
    }

    // Reiniciar el estado para permitir seleccionar una nueva ruta
    this.hasArrived = false; // Permitir seleccionar nuevas rutas después de cerrar el modal
    this.rutaActiva = false; // Reinicia la ruta activa
    this.modalAbierto = false;
    this.rastrearUbicacionUsuario();
    // No es necesario reiniciar el mapa, solo actualizar el estado
    console.log('Ruta cancelada. Puedes seleccionar una nueva tienda.');
  }

  cancelarLLegada(modal: any): void { 
    if (!this.rutaActiva) {
      console.warn('No hay una ruta activa, no se puede cancelar la llegada.');
      return;
    }
  
    modal.dismiss('cancel');
    
    setTimeout(() => {
      if (this.rutaActiva && this.destinationName) {
        console.log('Reabriendo modal de llegada después de la cancelación.');
        this.openModal(this.arriveModal, this.destinationName, '', '', '', '');
        this.modalAbierto = true;
      } else {
        console.warn('No se puede abrir el modal de llegada, no hay una ruta activa o el destino no está definido.');
      }
    }, 10000); // 10 segundos
  }

  setRating(rating: number): void {
    this.enteredRating = rating;
    console.log('Rating seleccionado: ', this.enteredRating);
  }

  updateButtonState() {
    this.isButtonDisabled = !(
      this.enteredCode &&
      this.enteredReview &&
      this.enteredRating > 0
    );
  }

  openModal(
    content: any,
    destinationName: string,
    status: string,
    specialties1: string,
    specialties2: string,
    imageUrl: string
  ): void {
    // Evitar abrir múltiples modales o abrir modal si ya se ha llegado
    if (this.openedModal || this.hasArrived) {
      return; // No abrir el modal si ya está abierto o si el usuario ya ha llegado
    }

    // Marcar como abierto y configurar las propiedades del modal
    this.destinationName = destinationName;
    this.shopStatus = status;
    this.specialties1 = specialties1;
    this.specialties2 = specialties2;
    this.currentImageUrl = imageUrl;
    this.openedModal = true;

    // Abrir el modal
    this.modalRef = this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });

    // Cerrar el modal y resetear el estado cuando se cierre
    this.modalRef.result.finally(() => {
      this.openedModal = false; // Reiniciar el estado del modal
    });
  }

  updateButtonReviewState() {
    this.isButtonDisabled = this.reviewApp.trim().length === 0;
  }

  addReviewToApp() {
    this.reviewService.addReview(this.reviewApp).subscribe(
      (res) => {
        toastr.success('Comentario añadido exitosamente');
        this.modalRef.close();
      },
      (err) => {
        toastr.error('No se ha podido añadir el comentario');
        this.modalRef.close();
      }
    );
  }

  resetModalFields() {
    this.enteredCode = '';
    this.enteredRating = 0;
    this.enteredReview = '';
    this.reviewApp = '';
    this.isButtonDisabled = true; // Opcional, si quieres desactivar el botón nuevamente
  }

  openModalWithCodigo(): void {
    this.resetModalFields();
    this.openModal(this.codeModal, '', '', '', '', '');
  }

  openModalAlbum(): void {
    this.openModal(this.modalBook, '', '', '', '', '');
  }

  openModalReviewShop(): void {
    this.resetModalFields();
    this.openModal(this.modalReviewShop, '', 'statusValue', '', '', '');
  }

  verifyCode() {
    // console.log('Primer bloque');
    this.storeService
      .verifyCodeCode(this.enteredCode, this.enteredReview, this.enteredRating)
      .subscribe(
        // this.storeService.verifyCodeCode(this.enteredCode).subscribe(
        (response) => {
          console.log(response);
          this.message = response.message;
          console.log(this.message);

          if (this.message === 'Código de verificación guardado exitosamente') {
            this.verifiedcode = true;
            if (response.shop) {
              console.log('2 bloque');
              // Llamar a verifyCodeOnce con el shopId y el código
              this.storeService
                .verifyCode(response.shop._id, this.enteredCode)
                .subscribe(
                  (res) => {
                    console.log('3 bloque');
                    console.log(res);
                    toastr.success(
                      'Código verificado y CoffeeCoins añadidos exitosamente'
                    );
                    // window.location.reload();
                    this.reloadComponent();
                    this.modalRef.close();
                  },
                  (err) => {
                    console.log('4 bloque');
                    if (
                      err.error.message ===
                      'La tienda ya está presente en el libro'
                    ) {
                      toastr.error('La tienda ya está presente en el álbum');
                    } else {
                      toastr.error('Error al añadir CoffeeCoins');
                    }
                    this.modalRef.close();
                  }
                );
            } else {
              toastr.success(
                'Código verificado y CoffeeCoins añadidos exitosamente'
              );
              this.reloadComponent();
              // window.location.reload();
            }
          } else {
            this.verifiedcode = false;
            toastr.error('Código de verificación no válido');
          }
          console.log('5 bloque');
          this.verified = false;
          this.modalRef.close();
        },
        (error) => {
          console.log('6 bloque');
          if (
            error.error.message === 'La tienda ya está presente en el libro'
          ) {
            toastr.warning(
              'La tienda ya está presente en el álbum pero te aumentamos coffecoins'
            );
            // window.location.reload();
            this.modalRef.close();
          } else {
            this.message = 'Error al verificar el código';
            toastr.error('Error al verificar el código');
          }
        }
      );
  }

  fetchUserData(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado en el almacenamiento local.');
      return;
    }

    this.userService.fetchUserData(token).subscribe(
      (data: any) => {
        this.userData = data;
        // console.log('Datos del usuario:', this.userData);
      },
      (error) => {
        console.error('Error al obtener los datos del usuario:', error);
      }
    );
  }

  fetchShopData(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado en el almacenamiento local.');
      return;
    }

    this.shopService.fetchShopData(token).subscribe(
      (data: any) => {
        this.shopData = data;
        // console.log('Datos de la tienda:', this.shopData); // Agrega esta línea para verificar la estructura de los datos
        this.populateShopLogos();
        this.iniciarMapa();
      },
      (error) => {
        console.error('Error al obtener los datos de la tienda:', error);
      }
    );
  }

  fetchBookData(): void {
    if (this.userId) {
      this.albumService.getBookData(this.userId).subscribe(
        (data) => {
          this.bookImages = data;
          this.obtainedStamps = this.bookImages.length;
          // console.log('Datos del álbum:', this.bookImages); // Para depuración
          // this.totalStamps = this.shopLogos.length; // Asume que totalStamps es igual a la cantidad de logos de tiendas
          // console.log(this.userId);
        },
        (error) => {
          console.error('Error al obtener los datos del álbum:', error);
        }
      );
    }
  }

  isLogoColored(logoUrl: string): boolean {
    const cleanLogoUrl = logoUrl.split(',')[1]; // Eliminar el prefijo de base64
    return this.bookImages.some((image) => {
      const cleanImageUrl = image.logoUrl.split(',')[1]; // Eliminar el prefijo de base64
      // console.log('Comparando:', cleanLogoUrl, 'con', cleanImageUrl); // Para depuración
      return cleanImageUrl === cleanLogoUrl;
    });
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
        return 'application/octet-stream'; // Tipo MIME genérico
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

  // Método para recargar el componente
  reloadComponent(): void {
    // Limpiar los datos actuales
    this.userData = null;
    this.shopData = [];
    this.bookImages = [];
    this.shopMarkers = [];
    this.shopLogos = [];

    // Volver a cargar los datos
    this.fetchUserData();
    this.fetchShopData();
    this.populateShopLogos();
    this.fetchBookData();
  }
}
