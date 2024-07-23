import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private readonly apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  fetchShopData(token: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/shop`, { headers }).pipe(
      catchError(error => {
        console.error('Error al obtener los datos de la tienda:', error);
        return throwError(() => error);
      })
    );
  }
}