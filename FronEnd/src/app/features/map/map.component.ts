import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import * as toastr from 'toastr';
import { AlbumService, Image } from '../../service/album.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnDestroy, AfterViewInit, OnInit {
  modalRef!: NgbModalRef;
  openedModal = false;
  title = 'Proyecto_Aroma';
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
  currentImageIndex: number = 0;  // Índice de la imagen actual para colorear

  @ViewChild('createModal', { static: true }) createModal: any;
  @ViewChild('cancelModal', { static: true }) cancelModal: any;
  @ViewChild('codeModal', { static: true }) codeModal: any;
  @ViewChild('modalBook', { static: true }) modalBook: any;
  @ViewChild('codeInput', { static: false }) codeInput!: ElementRef;

  constructor(private modalService: NgbModal, private albumService: AlbumService) {
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
  }

  ngAfterViewInit(): void {
    const map = new L.Map('map', {
      center: [6.150155571503784, -75.61905204382627],
      zoom: 13,
      attributionControl: false, // Desactiva el control de atribución
    });
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      // Si deseas conservar la atribución en otro lugar, puedes especificarlo aquí.
      // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    const aromaIcon = L.icon({
      iconUrl: 'assets/IconsMarker/cafeteriaAroma.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  
    const baulIcon = L.icon({
      iconUrl: 'assets/IconsMarker/cafeteriaCoffe.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  
    const lealIcon = L.icon({
      iconUrl: 'assets/IconsMarker/cafeteriaLeal.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  
    const aromaMarker = L.marker([6.15150999618405, -75.61369180892304], {
      icon: aromaIcon,
    })
      .addTo(map)
      .bindPopup('Aroma Café Sabaneta');
  
    const baulMarker = L.marker([6.149950147326389, -75.61758096298057], {
      icon: baulIcon,
    })
      .addTo(map)
      .bindPopup('Viejo Baul');
  
    const lealMarker = L.marker([6.150555615946403, -75.61797956390538], {
      icon: lealIcon,
    })
      .addTo(map)
      .bindPopup('Leal Coffee');
  
    map.fitBounds([
      [aromaMarker.getLatLng().lat, aromaMarker.getLatLng().lng],
      [baulMarker.getLatLng().lat, baulMarker.getLatLng().lng],
      [lealMarker.getLatLng().lat, lealMarker.getLatLng().lng],
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
  
        // Verificar si la precisión es aceptable (por ejemplo, menos de 50 metros)
        if (accuracy < 50) {
          userLocationMarker.setLatLng([userLat, userLng]);
          map.setView([userLat, userLng], map.getZoom());
  
          map.fitBounds([
            [aromaMarker.getLatLng().lat, aromaMarker.getLatLng().lng],
            [baulMarker.getLatLng().lat, baulMarker.getLatLng().lng],
            [lealMarker.getLatLng().lat, lealMarker.getLatLng().lng],
            [userLocationMarker.getLatLng().lat, userLocationMarker.getLatLng().lng],
          ]);
          console.log(userLocationMarker.getLatLng().lat, userLocationMarker.getLatLng().lng);
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
        timeout: 30000, // Aumentar el tiempo de espera para obtener una ubicación más precisa
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
    this.openModal(this.createModal);
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
    console.log(transport);
    console.log(profile);
    console.log(map);
    if (transport === 'foot' || transport === 'bike') {
      url = `https://routing.openstreetmap.de/${routed}/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    } else {
      url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    }

    console.log(url);
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

        if (transport === 'foot') {
          this.routingControl = L.polyline(routeCoordinates, {
            color: 'blue',
          }).addTo(map);
        } else if (transport === 'car') {
          this.routingControl = L.polyline(routeCoordinates, {
            color: 'red',
          }).addTo(map);
        } else {
          this.routingControl = L.polyline(routeCoordinates, {
            color: 'green',
          }).addTo(map);
        }
      })
      .catch((error) => {
        console.error('Error al obtener la ruta desde OSRM:', error);
        // Aquí puedes manejar el error de manera adecuada, por ejemplo, mostrar un mensaje al usuario
      });
  }

  selectTransportMode(mode: string) {
    this.selectedTransport = mode;
  }

  cancelRoute(): void {
    this.openModal(this.cancelModal);
  }

  confirmCancelRoute(): void {
    if (this.routingControl) {
      this.routingControl.remove();
      this.showCancelButton = false;
    }
    this.modalRef.close();
  }

  openModal(content: any): void {
    if (!this.openedModal) {
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

  ngOnDestroy(): void {
    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  openModalWithCodigo(): void {
    this.openModal(this.codeModal);
  }

  openModalAlbum(): void {
    this.openModal(this.modalBook);
  }

  verifyCode() {
    const storeCode = localStorage.getItem('storeCode');
    if (this.enteredCode === storeCode) {
      this.verified = true;
      toastr.success('Código verificado exitosamente','¡OBTUVISTE UNA ESTAMPITA!'); 
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
}