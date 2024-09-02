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
import { AuthService } from 'src/app/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, OnDestroy {
  modalRef!: NgbModalRef;
  openedModal = false;
  verifiedcode: boolean = false;
  destinationName!: string;
  enteredCode: string = '';
  verified: boolean = false;
  message: string = '';
  userData: any;
  shopData: any[] = [];
  hasArrived: boolean = false; // Nuevo estado para verificar si ya ha llegado
  shopLogos: { name: string; logoUrl: string }[] = [];
  shopMarkers: any[] = []; // Asegúrate de inicializar shopMarkers
  userId: string | null = null;
  bookImages: Image[] = [];
  obtainedStamps: number = 0;
  enteredRating: number = 0;
  enteredReview: string = '';
  showAlert: boolean = false;
  isButtonDisabled: boolean = true;
  google: any = window.google;
  modoTransporte: google.maps.TravelMode = google.maps.TravelMode.DRIVING;
  center: google.maps.LatLngLiteral = {
    lat: 6.150155571503784,
    lng: -75.61905204382627,
  };
  zoom = 15;
  rutaActiva: boolean = false;
  routeDetails: string | undefined;
  markerPosition: google.maps.LatLngLiteral | undefined;
  watchId: number | undefined;
  instruccionesRuta: string[] = [];
  private directionsService: google.maps.DirectionsService =
    new google.maps.DirectionsService();
  private directionsRendererInstance: google.maps.DirectionsRenderer =
    new google.maps.DirectionsRenderer();
  distanceMatrixService: google.maps.DistanceMatrixService =
    new google.maps.DistanceMatrixService();
  private hasZoomed: boolean = false;
  private markerUsuario: google.maps.Marker | undefined;
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
    zoomControl: false,
  };
  iconoUbicacionUsuario = {
    url: 'assets/IconsMarker/cosechaUser.png', // Ruta desde la raíz pública
    scaledSize: new google.maps.Size(40, 40),
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

  constructor(
    private modalService: NgbModal,
    private albumService: AlbumService,
    private userService: UserService,
    private storeService: StoreService,
    private shopService: ShopService,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // this.iniciarMapa();
    this.rastrearUbicacionUsuario();
    this.fetchUserData();
    this.fetchShopData();
    this.populateShopLogos();
    this.fetchBookData();
    this.userId = this.authService.getUserId(); // Obtener el ID del usuario

    if (this.userId) {
      this.fetchBookData();
    } else {
      console.error('No se encontró el ID del usuario.');
    }
    this.changeDetector.detectChanges();

    // Actualiza los datos cada 10 segundos (10000 ms)
    setInterval(() => {
      // this.fetchShopData();
      this.fetchBookData();
    }, 10000); // 10 segundos
  }

  ngOnDestroy() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  iniciarMapa() {
    const mapElement = document.getElementById('map') as HTMLElement;
    if (mapElement) {
      const map = new google.maps.Map(mapElement, {
        center: this.center,
        zoom: this.zoom,
        ...this.opcionesMapa,
      });

      this.directionsRendererInstance.setMap(map);

      // Verificar si markerPosition está definido antes de crear el marcador
      if (this.markerPosition) {
        this.markerUsuario = new google.maps.Marker({
          position: this.markerPosition,
          map: map,
          icon: this.iconoUbicacionUsuario,
        });
      } else {
        console.error('markerPosition no está definido.');
      }

      // Agregar los marcadores de las tiendas
      this.shopMarkers.forEach((markerData) => {
        const marker = new google.maps.Marker({
          position: markerData.position,
          map: map,
          icon: this.iconoTienda,
          title: markerData.title,
        });

        marker.addListener('click', () => {
          console.log(`Nombre de la tienda: ${markerData.title}`);
          this.openModal(this.createModal, markerData.title);
        });
      });
    } else {
      console.error('Elemento del mapa no encontrado.');
    }
  }

  // Actualiza rastrearUbicacionUsuario para recalcular la ruta y ajustar el zoom
  rastrearUbicacionUsuario() {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.markerPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
  
          console.log(
            'Ubicación del usuario actualizada:',
            this.markerPosition
          );
          this.actualizarMarcadorUbicacionUsuario();
  
          // Recalcular la ruta si está activa
          if (this.rutaActiva) {
            this.calcularRuta();
          }
  
          // Hacer zoom una vez cuando se encuentra la ubicación por primera vez
          const map = this.directionsRendererInstance.getMap();
          if (map) {
            map.panTo(this.markerPosition);
            if (!this.hasZoomed) {
              map.setZoom(17);
              this.hasZoomed = true;
            }
          }
  
          // Después de obtener la ubicación, solicitar el permiso de orientación
          this.solicitarPermisoOrientacion();
  
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
  

  actualizarMarcadorUbicacionUsuario() {
    if (this.markerPosition) {
      const map = this.directionsRendererInstance.getMap();
      if (map) {
        if (!this.markerUsuario) {
          this.markerUsuario = new google.maps.Marker({
            position: this.markerPosition,
            map: map,
            icon: this.iconoUbicacionUsuario,
          });
        } else {
          this.markerUsuario.setPosition(this.markerPosition);
        }
      }
    } else {
      console.error(
        'markerPosition no está definido en actualizarMarcadorUbicacionUsuario.'
      );
    }
  }

  centerOnUserLocation() {
    if (this.markerPosition) {
      const map = this.directionsRendererInstance.getMap();
      if (map) {
        // Suavizar el centrado del mapa
        map.panTo(this.markerPosition);

        // Opcional: Añadir un pequeño retraso para cambiar el zoom suavemente
        setTimeout(() => {
          map.setZoom(17); // Ajusta el nivel de zoom según sea necesario
        }, 300); // Ajusta el retraso según sea necesario
      }
    } else {
      console.error('La ubicación del usuario no está disponible.');
    }
  }

  solicitarPermisoOrientacion() {
    const deviceOrientationEvent = DeviceOrientationEvent as any;
  
    if (typeof deviceOrientationEvent.requestPermission === 'function') {
      deviceOrientationEvent.requestPermission()
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
      // Para dispositivos que no requieren permiso (Android u otros)
      this.iniciarOrientacionDispositivo();
    }
  }
  
  iniciarOrientacionDispositivo() {
    window.addEventListener('deviceorientation', (event) => {
      if (event.absolute && event.alpha !== null) {
        const heading = event.alpha;
  
        this.actualizarRotacionMarcador(heading);
      } else {
        console.error('No se pudo obtener la orientación del dispositivo.');
      }
    }, true); // Asegúrate de que la orientación se maneje en todos los contextos (incluso cuando la página está en segundo plano).
  }
  
  actualizarRotacionMarcador(heading: number) {
    if (this.markerUsuario) {
      const iconoRotado = {
        url: this.iconoUbicacionUsuario.url,
        rotation: heading,
        scaledSize: new google.maps.Size(50, 50), // Ajusta el tamaño si es necesario
        anchor: new google.maps.Point(25, 25), // Centra el ícono
      };
  
      this.markerUsuario.setIcon(iconoRotado);
    } else {
      console.error('No se pudo actualizar la rotación del marcador porque no existe.');
    }
  }
  
  
  seleccionarModoTransporte(modo: google.maps.TravelMode) {
    this.modoTransporte = modo;
  }

  calcularRuta() {
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
  
    let destination: google.maps.LatLngLiteral | string = '';
  
    if (typeof this.destinationName === 'object') {
      destination = {
        lat: (this.destinationName as google.maps.LatLngLiteral).lat,
        lng: (this.destinationName as google.maps.LatLngLiteral).lng,
      };
    } else {
      destination = this.destinationName;
    }
  
    const travelMode = this.modoTransporte ?? google.maps.TravelMode.DRIVING;
  
    const request: google.maps.DirectionsRequest = {
      origin: this.markerPosition,
      destination: destination,
      travelMode: travelMode,
      unitSystem: google.maps.UnitSystem.METRIC,
    };
  
    console.log('Solicitud de ruta:', request);
  
    // Desactiva los marcadores predeterminados
    this.directionsRendererInstance.setOptions({
      suppressMarkers: true,
    });
  
    this.directionsService.route(request, (result, status) => {
      console.log('Resultado de la ruta:', result);
      console.log('Estado de la ruta:', status);
  
      if (status === google.maps.DirectionsStatus.OK && result) {
        this.directionsRendererInstance.setDirections(result);
        this.obtenerDetallesRuta(result);
        this.rutaActiva = true;
  
        // Asegúrate de que el mapa maneje automáticamente el enfoque en la ruta
        const map = this.directionsRendererInstance.getMap();
        if (map) {
          map.fitBounds(result.routes[0].bounds); // Ajusta el mapa a la ruta
          this.hasZoomed = true; // Evita que el zoom cambie más adelante
        }
  
        // Cierra el modal después de calcular la ruta
        if (this.modalRef) {
          this.modalRef.close();
        }
      } else {
        console.error('Error al calcular la ruta:', status, result);
        this.toastr.warning(
          'La ruta en este medio de transporte no está disponible',
          'Advertencia'
        );
      }
    });
  }
  

  obtenerDetallesRuta(result: google.maps.DirectionsResult) {
    if (result.routes.length > 0) {
      const route = result.routes[0];
      if (route.legs.length > 0) {
        const leg = route.legs[0];
        const duration = leg.duration?.text;
        const distance = leg.distance?.text;
        const destination = leg.end_address;

        this.routeDetails = `Distancia: ${distance}, Tiempo estimado: ${duration}, Destino: ${destination}`;
        console.log(this.routeDetails);

        this.instruccionesRuta = [];
        leg.steps.forEach((step) => {
          this.instruccionesRuta.push(step.instructions);
        });
      }
    }
  }

  cancelarRuta() {
    if (this.directionsRendererInstance) {
      this.directionsRendererInstance.setMap(null); // Elimina el renderer del mapa
      this.directionsRendererInstance = new google.maps.DirectionsRenderer(); // Re-inicializa el renderizador
      this.rutaActiva = false; // Marca que la ruta ya no está activa
      this.instruccionesRuta = []; // Limpia las instrucciones de la ruta
      this.routeDetails = undefined; // Limpia los detalles de la ruta
      this.iniciarMapa(); // Actualiza el mapa para mostrar los marcadores
    }
  }

  closeAlert(): void {
    this.showAlert = false;
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

  cancelArrive(modal: any): void {
    modal.dismiss('cancel');
    setTimeout(() => {
      this.openModal(this.arriveModal, this.destinationName);
    }, 10000); // 10 segundos
  }

  openModal(content: any, destinationName: string): void {
    if (!this.openedModal && !this.hasArrived) {
      // Verifica que no se haya confirmado la llegada
      this.destinationName = destinationName;
      this.openedModal = true;
      this.modalRef = this.modalService.open(content, {
        centered: true,
        backdrop: 'static',
      });
      this.modalRef.result.finally(() => {
        this.openedModal = false;
      });
    }
  }

  resetModalFields() {
    this.enteredCode = '';
    this.enteredRating = 0;
    this.enteredReview = '';
    this.isButtonDisabled = true; // Opcional, si quieres desactivar el botón nuevamente
  }

  openModalWithCodigo(): void {
    this.resetModalFields();
    this.openModal(this.codeModal, '');
  }

  openModalAlbum(): void {
    this.openModal(this.modalBook, '');
  }

  verifyCode() {
    console.log('Primer bloque');
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
        this.updateShopMarkers();
      },
      (error) => {
        console.error('Error al obtener los datos de la tienda:', error);
      }
    );
  }

  updateShopMarkers() {
    this.shopMarkers = this.shopData.map((shop: any) => ({
      position: {
        lat: shop.latitude,
        lng: shop.longitude,
      },
      title: shop.name,
      status: shop.statusShop, // Supongo que 'statusShop' indica el estado
    }));

    const mapElement = document.getElementById('map') as HTMLElement;
    if (mapElement) {
      const map = new google.maps.Map(mapElement, {
        center: this.center,
        zoom: this.zoom,
        ...this.opcionesMapa,
      });

      this.directionsRendererInstance.setMap(map);

      this.shopMarkers.forEach((markerData) => {
        const marker = new google.maps.Marker({
          position: markerData.position,
          map: map,
          icon: this.iconoTienda, // Asegúrate de que `this.iconoTienda` sea una URL de imagen
          title: markerData.title,
        });

        marker.addListener('click', () => {
          console.log(`Nombre de la tienda: ${markerData.title}`);
          this.openModal(this.createModal, markerData.title); // Abre el modal con el nombre de la tienda
        });
      });
    }
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
