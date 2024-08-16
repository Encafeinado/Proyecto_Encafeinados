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
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import * as toastr from 'toastr';
import { AlbumService, Image } from '../../service/album.service';
import { StoreStatusService } from '../../service/store-status.service';
import { UserService } from '../../service/user.service';
import { StoreService } from '../../service/store.service';
import { ShopService } from '../../service/shop.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { AuthService } from 'src/app/auth/services/auth.service';
import 'leaflet-rotatedmarker';
// Extendemos la interfaz de L.Marker para incluir setRotationAngle
declare module 'leaflet' {
  interface Marker {
    setRotationAngle(angle: number): this;
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnDestroy, AfterViewInit, OnInit {
  modalRef!: NgbModalRef;
  openedModal = false;
  verifiedcode: boolean = false;
  selectedTransport: string = 'car';
  watchId: number | undefined;
  routingControl: any;
  showCancelButton: boolean = false;
  destinationName!: string;
  initialZoomDone: boolean = false; // Variable para controlar el zoom inicial
  userLocation: { lat: number; lng: number } | null = null; // Variable para almacenar la ubicación del usuario
  userLocationIcon: L.Icon;
  map!: L.Map;
  targetMarker!: L.Marker;
  userLocationMarker!: L.Marker;
  enteredCode: string = '';
  verified: boolean = false;
  message: string = '';
  albumImages: Image[] = [];
  images: Image[] = [];
  currentImageIndex: number = 0; // Índice de la imagen actual para colorear
  isStoreOpen: boolean = false;
  userData: any;
  shopData: any[] = [];
  userName: string = 'Nombre del Usuario';
  hasArrived: boolean = false; // Nuevo estado para verificar si ya ha llegado
  shopLogos: { name: string; logoUrl: string }[] = [];
  shopMarkers: any[] = []; // Asegúrate de inicializar shopMarkers
  userId: string | null = null;
  bookImages: Image[] = [];
  obtainedStamps: number = 0;
  isRouteActive: boolean = false;
  enteredRating: number = 0;
  enteredReview: string = '';
  // totalStamps: number = 0;

  showAlert: boolean = false;
  routeInfo: string = '';
  routeDistance: string = '';
  routeDuration: string = '';

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
    private changeDetector: ChangeDetectorRef
  ) {
    this.userLocationIcon = L.icon({
      iconUrl: 'assets/IconsMarker/cosechaUser.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  ngOnInit(): void {
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
      this.fetchShopData();
      this.fetchBookData();
    }, 10000); // 10 segundos
  }

  closeAlert(): void {
    this.showAlert = false;
  }
  setRating(rating: number): void {
    this.enteredRating = rating;
    console.log('Rating seleccionado: ', this.enteredRating);
  }
  showRouteConfirmation(
    map: L.Map,
    targetMarker: L.Marker,
    userLocationMarker: L.Marker,
    destinationName: string
  ): void {
    this.destinationName = destinationName;
    this.targetMarker = targetMarker;
    this.userLocationMarker = userLocationMarker;
    this.map = map;
    this.openModal(this.createModal, this.destinationName); // Asegúrate de pasar el nombre aquí
  }
  
  showRouteGuia(): void {
    console.log('showCancelButton antes:', this.showCancelButton);
    if (
      this.map &&
      this.targetMarker &&
      this.userLocationMarker &&
      this.destinationName
    ) {
      this.showRoute(
        this.map,
        this.userLocationMarker.getLatLng().lat,
        this.userLocationMarker.getLatLng().lng,
        this.targetMarker.getLatLng().lat,
        this.targetMarker.getLatLng().lng,
        this.targetMarker.options.icon as L.Icon,
        this.selectedTransport
      );
      this.showCancelButton = true;
      console.log('showCancelButton después:', this.showCancelButton);
      this.isRouteActive = true; // Marcamos que hay una ruta activa

      // Hacer zoom al marcador del usuario después de mostrar la ruta
      this.goToUserLocation();

      if (this.modalRef) {
        this.modalRef.close();
      }
    } else {
      console.error('Error: No se han inicializado los marcadores o el mapa.');
    }
  }

  showRoute(
    map: L.Map,
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    icon: L.Icon,
    transport: string
  ): void {
    let profile: string;
    let routed: string;
    let url: any;

    if (transport === 'foot') {
      profile = 'foot';
      routed = 'routed-foot';
    } else if (transport === 'car') {
      profile = 'driving';
      routed = 'routed-car';
    } else {
      profile = 'bike';
      routed = 'routed-bike';
    }

    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }

    if (transport === 'foot' || transport === 'bike') {
      url = `https://routing.openstreetmap.de/${routed}/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    } else {
      url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    }

    fetch(url)
      .then((response) => {
        console.log(url);
        if (!response.ok) {
          throw new Error('Error en la solicitud al servicio OSM');
        }
        return response.json();
      })
      .then((data) => {
        if (!data || !data.routes || data.routes.length === 0) {
          throw new Error('No se encontraron rutas válidas');
        }

        const route = data.routes[0]; // Tomar la primera ruta (asumiendo que es la más óptima)
        const routeCoordinates = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        // Dibujar la ruta en el mapa usando Leaflet
        let color = 'blue'; // Default color for foot transport

        if (transport === 'car') {
          color = 'red';
        } else if (transport === 'bike') {
          color = 'green';
        }

        if (this.routingControl) {
          this.routingControl.remove();
        }

        this.routingControl = L.polyline(routeCoordinates, {
          color: color,
        }).addTo(map);

        // Calcular el tiempo estimado basado en la velocidad promedio
        const averageSpeeds: { [key: string]: number } = {
          foot: 5, // km/h
          bike: 15, // km/h
          car: 40, // km/h
        };

        const speed = averageSpeeds[transport] || averageSpeeds['foot']; // Default to foot speed if transport type is unknown
        const routeDistanceKm = route.distance / 1000; // Convert distance to kilometers
        const estimatedTimeHours = routeDistanceKm / speed; // Time in hours
        const estimatedTimeMinutes = estimatedTimeHours * 60; // Convert to minutes

        // Mostrar la distancia y tiempo estimado
        this.routeDistance = routeDistanceKm.toFixed(2); // Distancia en kilómetros
        this.routeDuration = estimatedTimeMinutes.toFixed(0); // Duración en minutos
        this.routeInfo = `Ruta hacia ${this.destinationName}`;

        // Mostrar la alerta con la información de la ruta
        this.showAlert = true;
      })
      .catch((error) => {
        console.error('Error al obtener la ruta desde OSM:', error);
      });
  }

  selectTransportMode(mode: string) {
    this.selectedTransport = mode;
  }

  cancelRoute(): void {
    console.log('Ruta cancelada');
    this.openModal(this.cancelModal, '');
  }

  confirmCancelRoute(): void {
    if (this.routingControl) {
        this.routingControl.remove();
        this.routingControl = null; // Asegúrate de eliminar la referencia
    }

    // Eliminar cualquier marcador asociado
    if (this.targetMarker) {
        this.targetMarker.remove();
    }

    // Ocultar el botón de cancelar
    this.showCancelButton = false;

    // Cerrar la alerta si está abierta
    this.closeAlert();

    // Cerrar el modal
    if (this.modalRef) {
        this.modalRef.close();
    }

    this.isRouteActive = false; // Indicar que no hay una ruta activa
  }

  confirmArrive(): void {
    this.hasArrived = true; // Marca que el usuario ya ha llegado
    if (this.routingControl) {
      this.routingControl.remove();
      this.showCancelButton = false;
      this.closeAlert(); // Cerrar la alerta
    }
    this.modalRef.close(); // Cierra el modal
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

  private createStoreIcon(
    iconUrl: string,
    isOpen: boolean,
    additionalClass: string = ''
  ) {
    return L.divIcon({
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <img src="${iconUrl}" class="${additionalClass}" style="width: 25px; height: 41px; border-radius: 5px;" />
          <div style="position: absolute; top: -5px; right: -5px; width: 12px; height: 12px; background-color: ${
            isOpen ? 'green' : 'red'
          }; border-radius: 50%; border: 2px solid white;"></div>
        </div>
      `,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      className: '',
    });
  }

  ngOnDestroy(): void {
    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  openModalWithCodigo(): void {
    this.openModal(this.codeModal, '');
  }

  openModalAlbum(): void {
    this.openModal(this.modalBook, '');
  }

  verifyCode() {
    console.log('Primer bloque');
    this.storeService.verifyCodeCode(this.enteredCode, this.enteredReview, this.enteredRating).subscribe(
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
        if (error.error.message === 'La tienda ya está presente en el libro') {
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

  ngAfterViewInit(): void {
    this.map = new L.Map('map', {
      center: [6.150155571503784, -75.61905204382627], // Coordenadas iniciales
      zoom: 13,
      attributionControl: false,
      zoomDelta: 0.5,
      zoomSnap: 0.1,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.userLocationMarker = L.marker([0, 0], {
      icon: this.userLocationIcon,
    })
      .addTo(this.map)
      .bindPopup('Tu ubicación actual');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        if (accuracy < 50) {
          this.userLocationMarker.setLatLng([userLat, userLng]);
          this.userLocation = { lat: userLat, lng: userLng };

          if (!this.initialZoomDone) {
            this.map.setView([userLat, userLng], 15, {
              animate: true,
            });
            this.initialZoomDone = true;
          }

          if (this.targetMarker) {
            this.updateRoute(
              userLat,
              userLng,
              this.targetMarker.getLatLng().lat,
              this.targetMarker.getLatLng().lng,
              this.selectedTransport
            );
          }

          this.checkProximityToStores(userLat, userLng, this.shopMarkers);
        }
      },
      (error) => {
        console.error('Error al obtener la ubicación del usuario:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000,
      }
    );

    this.requestOrientationPermission();
  }

  requestOrientationPermission() {
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            console.log('Permiso de orientación otorgado');
            window.addEventListener(
              'deviceorientation',
              this.handleOrientation.bind(this),
              true
            );
          } else {
            console.log('Permiso de orientación denegado');
          }
        })
        .catch((error: unknown) => {
          console.error('Error al solicitar permiso de orientación:', error);
        });
    } else {
      console.log('No es necesario solicitar permisos de orientación');
      window.addEventListener(
        'deviceorientation',
        this.handleOrientation.bind(this),
        true
      );
    }
  }

  handleOrientation(event: DeviceOrientationEvent) {
    const alpha = event.alpha;

    if (alpha !== null) {
      console.log('Ángulo de rotación detectado:', alpha);
      this.userLocationMarker.setRotationAngle(alpha || 0);
    } else {
      console.warn('No se pudo obtener la orientación del dispositivo.');
    }
  }

  updateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  transport: string
): void {
  try {
    const waypoints = [
      L.latLng(startLat, startLng),
      L.latLng(endLat, endLng)
    ];

    if (this.routingControl) {
      this.routingControl.setLatLngs(waypoints); // Actualiza la ruta existente sin recrearla
    } else {
      this.showRoute(this.map, startLat, startLng, endLat, endLng, this.userLocationIcon, transport);
    }
  } catch (error) {
    console.error('Error al actualizar la ruta, recreando...', error);
    // Si falla, elimina y vuelve a crear la ruta
    if (this.routingControl) {
      this.routingControl.remove();
      this.routingControl = null;
    }
    this.showRoute(this.map, startLat, startLng, endLat, endLng, this.userLocationIcon, transport);
  }
}  

  checkProximityToStores(
    userLat: number,
    userLng: number,
    markers: { marker: L.Marker; name: string; iconUrl: string }[] // Define claramente el tipo aquí
  ) {
    const proximityThreshold = 10; // 10 metros

    markers.forEach(({ marker, name, iconUrl }) => {
      const { lat, lng } = marker.getLatLng();
      const distance = this.calculateDistance(userLat, userLng, lat, lng);

      const shop = this.shopData.find((s) => s.name === name); // Encuentra la tienda correspondiente
      if (shop) {
        const statusShop = shop.statusShop; // Accede a statusShop de la tienda encontrada

        if (distance <= proximityThreshold) {
          marker.setIcon(this.createStoreIcon(iconUrl, statusShop));
          console.log(`Estás cerca de ${name}`);
          this.openModal(this.arriveModal, name); // Pasa el nombre de la cafetería
        } else {
          marker.setIcon(
            this.createStoreIcon(iconUrl, statusShop, 'grayscale-icon')
          );
        }
      } else {
        console.error(`No se encontró la tienda con nombre ${name}`);
      }
    });
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
        this.addShopMarkersToMap(false); // Pasar false para no hacer zoom
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

  goToUserLocation(): void {
    if (this.userLocation) {
      const zoomLevel = this.isRouteActive ? 18 : 15; // Ajustar el nivel de zoom según el estado de la ruta

      this.map.flyTo(
        [this.userLocation.lat, this.userLocation.lng],
        zoomLevel,
        {
          animate: true,
          duration: 1.5, // Duración de la animación en segundos
        }
      );
    } else {
      console.error('La ubicación del usuario no está disponible.');
    }
  }

  addShopMarkersToMap(shouldZoom: boolean = true): void {
    if (!this.map) {
      console.error('El mapa no está inicializado.');
      return;
    }

    this.shopMarkers = this.shopData
      .map((shop) => {
        const lat = shop.latitude;
        const lng = shop.longitude;

        if (typeof lat !== 'number' || typeof lng !== 'number') {
          console.error('Coordenadas inválidas para la tienda:', shop);
          return null;
        }

        const iconUrl = 'assets/IconsMarker/cafeteria.png'; // Usamos la misma imagen para todas las tiendas
        const marker = L.marker([lat, lng], {
          icon: this.createStoreIcon(iconUrl, shop.statusShop),
        })
          .addTo(this.map)
          .bindPopup(shop.name);

        marker.on('click', () => {
          this.showRouteConfirmation(
            this.map,
            marker,
            this.userLocationMarker,
            shop.name
          );
        });

        return {
          marker,
          name: shop.name,
          iconUrl: iconUrl,
        };
      })
      .filter((markerData) => markerData !== null);

    if (shouldZoom && this.shopMarkers.length > 0) {
      this.map.fitBounds(
        this.shopMarkers.map((data) => [
          data.marker.getLatLng().lat,
          data.marker.getLatLng().lng,
        ])
      );
    }
  }

  // Método para calcular la distancia
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = this.degreesToRadians(lat1);
    const φ2 = this.degreesToRadians(lat2);
    const Δφ = this.degreesToRadians(lat2 - lat1);
    const Δλ = this.degreesToRadians(lng2 - lng1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distancia en metros
    return distance;
  }

  // Método para convertir grados a radianes
  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
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
    console.log('Recargadoooooooooooooooo');
  }
}
