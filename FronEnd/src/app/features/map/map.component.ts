import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import * as toastr from 'toastr';
import { AlbumService, Image } from '../../service/album.service';
import { StoreStatusService } from '../../service/store-status.service';
import { UserService } from '../../service/user.service';
import { ShopService } from '../../service/shop.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnDestroy, AfterViewInit, OnInit {
  modalRef!: NgbModalRef;
  openedModal = false;
  selectedTransport: string = 'car';
  watchId: number | undefined;
  routingControl: any;
  showCancelButton: boolean = false;
  destinationName!: string;
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
  private apiUrl = 'https://encafeinados-backend.up.railway.app'; // Ajusta según sea necesario
  userData: any;
  shopData: any;

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
    this.isStoreOpen = this.storeStatusService.isStoreActivated();
    this.fetchUserData();
    this.fetchShopData();
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
        console.log('Datos del usuario:', this.userData);
      },
      error => {
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
        console.log('Datos de la tienda:', this.shopData);
      },
      error => {
        console.error('Error al obtener los datos de la tienda:', error);
      }
    );
  }

  ngAfterViewInit(): void {
    const map = new L.Map('map', {
      center: [6.150155571503784, -75.61905204382627],
      zoom: 13,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const casaMarker = L.marker([6.34147392395257, -75.51329608725513],{
      icon: this.createStoreIcon(
        'assets/IconsMarker/cafeteria.png',
        this.isStoreOpen,
        'grayscale-icon'
      ),
    }).addTo(map)
    .bindPopup('Casa');

    const aromaMarker = L.marker([6.15150999618405, -75.61369180892304], {
      icon: this.createStoreIcon(
        'assets/IconsMarker/cafeteriaAroma.png',
        this.isStoreOpen,
        'grayscale-icon'
      ),
    })
      .addTo(map)
      .bindPopup('Aroma Café Sabaneta');

    const baulMarker = L.marker([6.149950147326389, -75.61758096298057], {
      icon: this.createStoreIcon(
        'assets/IconsMarker/cafeteriaCoffe.png',
        this.isStoreOpen,
        'grayscale-icon'
      ),
    })
      .addTo(map)
      .bindPopup('Viejo Baul');

    const lealMarker = L.marker([6.150555615946403, -75.61797956390538], {
      icon: this.createStoreIcon(
        'assets/IconsMarker/cafeteriaLeal.png',
        this.isStoreOpen,
        'grayscale-icon'
      ),
    })
      .addTo(map)
      .bindPopup('Leal Coffee');

    map.fitBounds([
      [aromaMarker.getLatLng().lat, aromaMarker.getLatLng().lng],
      [baulMarker.getLatLng().lat, baulMarker.getLatLng().lng],
      [lealMarker.getLatLng().lat, lealMarker.getLatLng().lng],
      [casaMarker.getLatLng().lat, casaMarker.getLatLng().lng]
    ]);

    const userLocationMarker = L.marker([0, 0], { icon: this.userLocationIcon })
      .addTo(map)
      .bindPopup('Tu ubicación actual');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log('Posición obtenida:', position);

        if (accuracy < 50) {
          userLocationMarker.setLatLng([userLat, userLng]);
          map.setView([userLat, userLng], map.getZoom());

          map.fitBounds([
            [aromaMarker.getLatLng().lat, aromaMarker.getLatLng().lng],
            [baulMarker.getLatLng().lat, baulMarker.getLatLng().lng],
            [lealMarker.getLatLng().lat, lealMarker.getLatLng().lng],
            [casaMarker.getLatLng().lat, casaMarker.getLatLng().lng],
            [
              userLocationMarker.getLatLng().lat,
              userLocationMarker.getLatLng().lng,
            ],
          ]);

          this.checkProximityToStores(
            userLat,
            userLng,
            aromaMarker,
            baulMarker,
            lealMarker,
            casaMarker
          );

          console.log(
            userLocationMarker.getLatLng().lat,
            userLocationMarker.getLatLng().lng
          );
        } else {
          console.log('Precisión no aceptable:', accuracy);
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

    aromaMarker.on('click', () => {
      this.showRouteConfirmation(
        map,
        aromaMarker,
        userLocationMarker,
        'Aroma Café Sabaneta'
      );
    });

    baulMarker.on('click', () => {
      this.showRouteConfirmation(
        map,
        baulMarker,
        userLocationMarker,
        'Viejo Baul'
      );
    });

    lealMarker.on('click', () => {
      this.showRouteConfirmation(
        map,
        lealMarker,
        userLocationMarker,
        'Leal Coffee'
      );
    });
  }

  checkProximityToStores(
    userLat: number,
    userLng: number,
    aromaMarker: L.Marker,
    baulMarker: L.Marker,
    lealMarker: L.Marker,
    casaMarker: L.Marker
  ) {
    const proximityThreshold = 0.1; // Ajusta este valor según tus necesidades (en grados de latitud/longitud)
  
    const distanceToAroma = this.calculateDistance(
      userLat,
      userLng,
      aromaMarker.getLatLng().lat,
      aromaMarker.getLatLng().lng
    );
    const distanceToBaul = this.calculateDistance(
      userLat,
      userLng,
      baulMarker.getLatLng().lat,
      baulMarker.getLatLng().lng
    );
    const distanceToLeal = this.calculateDistance(
      userLat,
      userLng,
      lealMarker.getLatLng().lat,
      lealMarker.getLatLng().lng
    );
    const distanceToCasa = this.calculateDistance(
      userLat,
      userLng,
      casaMarker.getLatLng().lat,
      casaMarker.getLatLng().lng
    );
  
    if (distanceToAroma <= proximityThreshold) {
      aromaMarker.setIcon(
        this.createStoreIcon(
          'assets/IconsMarker/cafeteriaAroma.png',
          this.isStoreOpen
        )
      );
      console.log('Estás cerca de Aroma Café Sabaneta');
      this.openModal(this.arriveModal, 'Aroma Café Sabaneta'); // Pasa el nombre de la cafetería
    } else {
      aromaMarker.setIcon(
        this.createStoreIcon(
          'assets/IconsMarker/cafeteriaAroma.png',
          this.isStoreOpen,
          'grayscale-icon'
        )
      );
    }
  
    if (distanceToBaul <= proximityThreshold) {
      baulMarker.setIcon(
        this.createStoreIcon(
          'assets/IconsMarker/cafeteriaCoffe.png',
          this.isStoreOpen
        )
      );
      console.log('Estás cerca de Viejo Baul');
      this.openModal(this.arriveModal, 'Viejo Baul'); // Pasa el nombre de la cafetería
    } else {
      baulMarker.setIcon(
        this.createStoreIcon(
          'assets/IconsMarker/cafeteriaCoffe.png',
          this.isStoreOpen,
          'grayscale-icon'
        )
      );
    }
  
    if (distanceToLeal <= proximityThreshold) {
      lealMarker.setIcon(
        this.createStoreIcon(
          'assets/IconsMarker/cafeteriaLeal.png',
          this.isStoreOpen
        )
      );
      console.log('Estás cerca de Leal Coffee');
      this.openModal(this.arriveModal, 'Leal Coffee'); // Pasa el nombre de la cafetería
    } else {
      lealMarker.setIcon(
        this.createStoreIcon(
          'assets/IconsMarker/cafeteriaLeal.png',
          this.isStoreOpen,
          'grayscale-icon'
        )
      );
    }
  
    if (distanceToCasa <= proximityThreshold) {
      casaMarker.setIcon(
        this.createStoreIcon(
          'assets/IconsMarker/cafeteria.png',
          this.isStoreOpen
        )
      );
      console.log('Estás cerca de Casa');
      this.openModal(this.arriveModal, 'Casa'); // Pasa el nombre de la cafetería
    } else {
      casaMarker.setIcon(
        this.createStoreIcon(
          'assets/IconsMarker/cafeteria.png',
          this.isStoreOpen,
          'grayscale-icon'
        )
      );
    }
  }
  

  calculateDistance(
    userLat: number,
    userLng: number,
    markerLat: number,
    markerLng: number
  ): number {
    const earthRadius = 6371; // Radio de la Tierra en kilómetros
    const latDistance = this.degreesToRadians(markerLat - userLat);
    const lngDistance = this.degreesToRadians(markerLng - userLng);

    const a =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(this.degreesToRadians(userLat)) *
        Math.cos(this.degreesToRadians(markerLat)) *
        Math.sin(lngDistance / 2) *
        Math.sin(lngDistance / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c; // Distancia en kilómetros
  }

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
    this.openModal(this.createModal, '');
  }

  showRouteGuia(): void {
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
      this.modalRef.close();
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

        this.routingControl = L.polyline(routeCoordinates, {
          color: color,
        }).addTo(map);
      })
      .catch((error) => {
        console.error('Error al obtener la ruta desde OSRM:', error);
        // Manejar el error adecuadamente, por ejemplo, mostrar un mensaje al usuario
      });
  }

  selectTransportMode(mode: string) {
    this.selectedTransport = mode;
  }

  cancelRoute(): void {
    this.openModal(this.cancelModal, '');
  }

  confirmCancelRoute(): void {
    if (this.routingControl) {
      this.routingControl.remove();
      this.showCancelButton = false;
    }
    this.modalRef.close();
  }

  openModal(content: any, destinationName: string): void {
    if (!this.openedModal) {
      this.destinationName = destinationName;
      this.openedModal = true;
      this.modalRef = this.modalService.open(content, {
        centered: true,
        backdrop: 'static',
      });
      this.modalRef.result.then(
        () => {
          this.openedModal = false;
        },
        () => {
          this.openedModal = false;
        }
      );
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
    const storeCode = localStorage.getItem('storeCode');
    if (this.enteredCode === storeCode) {
      this.verified = true;
      toastr.success(
        'Código verificado exitosamente',
        '¡OBTUVISTE UNA ESTAMPITA!'
      );
      this.coloredImage();
      setTimeout(() => {
        this.modalRef.close(); // Método para cerrar el modal
      }, 2000);
    } else {
      this.verified = false;
      toastr.error('Error al verificar el código');
    }
  }

  coloredImage(): void {
    if (this.currentImageIndex < this.albumImages.length) {
      this.albumImages[this.currentImageIndex].colored = true;
      this.currentImageIndex++;
    } else {
      console.log('Todas las imágenes ya están coloreadas');
    }
  }

  get obtainedStamps(): number {
    return this.albumImages.filter(image => image.colored).length;
  }

  get totalStamps(): number {
    return this.albumImages.length;
  }
}