import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
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
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  currentImageIndex: number = 0; // Índice de la imagen actual para colorear
  isStoreOpen: boolean = false;
  private apiUrl = 'http://localhost:3000'; // Ajusta según sea necesario
  userData: any;
  shopData: any[] = [];
  userName: string = 'Nombre del Usuario';
  hasArrived: boolean = false; // Nuevo estado para verificar si ya ha llegado
  shopLogos: { name: string; logoUrl: string }[] = [];
  shopMarkers: any[] = []; // Asegúrate de inicializar shopMarkers

  @ViewChild('createModal', { static: true }) createModal: any;
  @ViewChild('cancelModal', { static: true }) cancelModal: any;
  @ViewChild('codeModal', { static: true }) codeModal: any;
  @ViewChild('modalBook', { static: true }) modalBook: any;
  @ViewChild('codeInput', { static: false }) codeInput!: ElementRef;
  @ViewChild('arriveModal', { static: true }) arriveModal: any;

  constructor(
    private modalService: NgbModal,
    private albumService: AlbumService,
    private storeStatusService: StoreStatusService,
    private userService: UserService,
    private storeService: StoreService,
    private shopService: ShopService,
    private http: HttpClient
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
    this.albumImages = this.albumService.getAlbumImages();
    this.fetchUserData();
    this.fetchShopData();
    this.populateShopLogos();
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
        console.log('Datos de la tienda:', this.shopData); // Agrega esta línea para verificar la estructura de los datos
        this.populateShopLogos();
        this.addShopMarkersToMap();
      },
      (error) => {
        console.error('Error al obtener los datos de la tienda:', error);
      }
    );
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
    console.log('Logos de la tienda: ', this.shopLogos);
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
      this.map.setView([this.userLocation.lat, this.userLocation.lng], 15, {
        animate: true,
        duration: 1.5, // Duración de la animación en segundos
      });
    } else {
      console.error('La ubicación del usuario no está disponible.');
    }
  }

  addShopMarkersToMap(): void {
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

    if (this.shopMarkers.length > 0) {
      this.map.fitBounds(
        this.shopMarkers.map((data) => [
          data.marker.getLatLng().lat,
          data.marker.getLatLng().lng,
        ])
      );
    }
  }

  ngAfterViewInit(): void {
    this.map = new L.Map('map', {
      center: [6.150155571503784, -75.61905204382627], // Coordenadas iniciales
      zoom: 13,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.userLocationMarker = L.marker([0, 0], {
      icon: this.userLocationIcon,
    })
      .addTo(this.map)
      .bindPopup('Tu ubicación actual');

    // Carga los datos de la tienda y los marcadores
    this.fetchShopData();

    // Observa la ubicación del usuario
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        if (accuracy < 50) {
          this.userLocationMarker.setLatLng([userLat, userLng]);
          this.userLocation = { lat: userLat, lng: userLng };

          if (!this.initialZoomDone) {
            // Centra el mapa en la ubicación del usuario con un zoom de nivel 15
            this.map.setView([userLat, userLng], 15, {
              animate: true,
            });
            this.initialZoomDone = true;
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
      // Asegúrate de que el modal se cierre correctamente
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
      routed = 'routed-driving';
    } else {
      profile = 'bike';
      routed = 'routed-bike';
    }

    if (transport === 'foot' || transport === 'bike') {
      url = `https://routing.openstreetmap.de/${routed}/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    } else {
      url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la solicitud al servicio OSRM');
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

        // Mostrar la distancia y tiempo estimado
        const distance = route.distance / 1000; // Distancia en kilómetros
        const duration = route.duration / 60; // Duración en minutos

        toastr.info(
          `Ruta hacia ${this.destinationName} es de ${distance.toFixed(
            2
          )} km y tomará aproximadamente ${duration.toFixed(0)} minutos.`
        );
      })
      .catch((error) => {
        console.error('Error al obtener la ruta desde OSRM:', error);
        toastr.error('Error al obtener la ruta');
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
      this.showCancelButton = false;
    }
    this.modalRef.close();
  }

  confirmArrive(): void {
    this.hasArrived = true; // Marca que el usuario ya ha llegado
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
    console.log('Primer bloque)');
    this.storeService.verifyCodeCode(this.enteredCode).subscribe(
      (response) => {
        console.log(response);
        this.message = response.message;
        console.log(this.message);

        if (this.message === 'Código de verificación guardado exitosamente') {
          this.verifiedcode = true;
          if (response.shop) {
            console.log('2 bloque)');
            // Llamar a verifyCodeOnce con el shopId y el código
            this.storeService
              .verifyCode(response.shop._id, this.enteredCode)
              .subscribe(
                (res) => {
                  console.log('3 bloque)');
                  console.log(res);
                  toastr.success(
                    'Código verificado y CoffeeCoins añadidos exitosamente'
                  );
                  this.modalRef.close();
                },
                (err) => {
                  console.log('4 bloque)');
                  toastr.error('Error al añadir CoffeeCoins');
                  this.modalRef.close();
                }
              );
          } else {
            toastr.success(
              'Código verificado y CoffeeCoins añadidos exitosamente'
            );
          }
        } else {
          this.verifiedcode = false;
          toastr.error('Código de verificación no válido');
        }
        console.log('5 bloque)');
        this.verified = false;
        this.modalRef.close();
      },
      (error) => {
        console.log('6 bloque)');
        this.message = 'Error al verificar el código';
        toastr.error('Error al verificar el código');
      }
    );
  }

  coloredImage(): void {
    if (this.currentImageIndex < this.albumImages.length) {
      this.albumImages[this.currentImageIndex].colored = true;
      this.currentImageIndex++;
    } else {
      // console.log('Todas las imágenes ya están coloreadas');
    }
  }

  get obtainedStamps(): number {
    return this.albumImages.filter((image) => image.colored).length;
  }

  get totalStamps(): number {
    // La cantidad total de estampas es igual a la cantidad total de tiendas
    if (!this.shopData) {
      return 0;
    }

    return this.shopData.length;
  }
}
