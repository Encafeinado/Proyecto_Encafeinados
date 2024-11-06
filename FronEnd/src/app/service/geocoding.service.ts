import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare const google: any; // Declaramos google para que TypeScript lo reconozca

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  constructor() {}

  // Método para autocompletar la dirección
  autocompleteAddress(inputElement: HTMLInputElement): Observable<any> {
    return new Observable(observer => {
      const autocomplete = new google.maps.places.Autocomplete(inputElement, {
        types: ['address'] // Solo autocompleta direcciones
      });

      // Evento para capturar los resultados
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          observer.next(place);
          observer.complete();
        } else {
          observer.error('No se encontró una dirección válida');
        }
      });
    });
  }

  // Método para geocodificar la dirección
  geocodeAddress(address: string): Observable<google.maps.GeocoderResult[]> {
    return new Observable(observer => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          observer.next(results);
          observer.complete();
        } else {
          observer.error('No se pudo geocodificar la dirección');
        }
      });
    });
  }
}
