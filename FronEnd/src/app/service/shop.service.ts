import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = 'https://encafeinados-backend.up.railway.app'; // Ajusta según sea necesario

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