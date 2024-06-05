import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import * as toastr from 'toastr';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnDestroy, AfterViewInit {
  modalRef!: NgbModalRef;
  openedModal = false;
  title = 'Proyecto_Aroma';
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

  albumImages = [
    {
      src: 'https://via.placeholder.com/150',
      alt: 'Imagen 1',
      info: 'Información sobre la imagen 1',
    },
    {
      src: 'https://via.placeholder.com/150',
      alt: 'Imagen 2',
      info: 'Información sobre la imagen 2',
    },
    {
      src: 'https://via.placeholder.com/150',
      alt: 'Imagen 3',
      info: 'Información sobre la imagen 3',
    },
    {
      src: 'https://via.placeholder.com/150',
      alt: 'Imagen 4',
      info: 'Información sobre la imagen 4',
    },
    {
      src: 'https://via.placeholder.com/150',
      alt: 'Imagen 5',
      info: 'Información sobre la imagen 5',
    },
    {
      src: 'https://via.placeholder.com/150',
      alt: 'Imagen 6',
      info: 'Información sobre la imagen 6',
    },
  ];

  @ViewChild('createModal', { static: true }) createModal: any;
  @ViewChild('cancelModal', { static: true }) cancelModal: any;
  @ViewChild('codeModal', { static: true }) codeModal: any;
  @ViewChild('modalBook', { static: true }) modalBook: any;
  @ViewChild('codeInput', { static: false }) codeInput!: ElementRef;

  constructor(private modalService: NgbModal) {
    this.userLocationIcon = L.icon({
      iconUrl: 'assets/IconsMarker/cosechaUser.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    console.log(this.userLocationIcon);
    console.log('6.15150999618405, -75.61369180892304');
  }

  ngAfterViewInit(): void {
    const map = new L.Map('map').setView(
      [6.150155571503784, -75.61905204382627],
      13
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

        userLocationMarker.setLatLng([userLat, userLng]);
        map.setView([userLat, userLng], map.getZoom());

        map.fitBounds([
          [aromaMarker.getLatLng().lat, aromaMarker.getLatLng().lng],
          [baulMarker.getLatLng().lat, baulMarker.getLatLng().lng],
          [lealMarker.getLatLng().lat, lealMarker.getLatLng().lng],
          [
            userLocationMarker.getLatLng().lat,
            userLocationMarker.getLatLng().lng,
          ],
        ]);
        console.log(
          userLocationMarker.getLatLng().lat,
          userLocationMarker.getLatLng().lng
        );
      },
      (error) => {
        console.error('Error al obtener la ubicación del usuario:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
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
        this.targetMarker.options.icon as L.Icon
      );
      this.showCancelButton = true;
      this.modalRef.close();
    } else {
      console.error('Error: No se han inicializado los marcadores o el mapa.');
    }
  }

  showRoute( map: L.Map, startLat: number,startLng: number,endLat: number,endLng: number,icon: L.Icon): void {
    this.routingControl = (L as any).Routing.control({
      waypoints: [L.latLng(startLat, startLng), L.latLng(endLat, endLng)],
      routeWhileDragging: true,
      createMarker: (i: number, waypoint: any, n: number) => {
        if (i === n - 1) {
          return L.marker(waypoint.latLng, { icon: icon });
        } else {
          return L.marker(waypoint.latLng, { icon: this.userLocationIcon });
        }
      },
    }).addTo(map);
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
    console.log(storeCode);
    console.log('Codigo hola');
    if (this.enteredCode === storeCode) {
      this.verified = true;
      console.log('Codigo exitoso verificado');
      toastr.success('Código verificado exitosamente');
      setTimeout(() => {
        this.modalRef.close(); // Método para cerrar el modal
      }, 2000);
    } else {
      this.verified = false;
      console.log('Codigo incorrecto');
      toastr.error('Error al verificar el código');
    }
  }
}
