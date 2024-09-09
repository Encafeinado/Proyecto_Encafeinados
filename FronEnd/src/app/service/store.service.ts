// store.service.ts
import { Injectable } from '@angular/core';
import { Shop } from '../features/store/interfaces/shop.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importa HttpHeaders
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private codeEntries: number = Number(localStorage.getItem('codeEntries')) || 0;
  private isStoreOpen: boolean = localStorage.getItem('isStoreOpen') === 'true';
  private baseUrl = `${environment.baseUrl}/shop`; // Asegúrate de que esta URL coincida con tu backend

  constructor(private http: HttpClient) {}

  getCodeEntries(): number {
    return this.codeEntries;
  }

  incrementCodeEntries(): void {
    this.codeEntries++;
    localStorage.setItem('codeEntries', this.codeEntries.toString());
  }

  isStoreActivated(): boolean {
    return this.isStoreOpen;
  }

  getShopById(id: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.baseUrl}/${id}`);
  }

  verifyCode(shopId: string, code: string): Observable<{ message: string }> {
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Configurar la cabecera con el token
    const url = `${this.baseUrl}/verify/${shopId}`;
    return this.http.post<{ message: string }>(url, { code }, { headers });
  }

// store.service.ts
verifyCodeCode(code: string, review: string, rating: number): Observable<{ message: string, shop: Shop }> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.baseUrl}/verify-code`;
  return this.http.post<{ message: string, shop: Shop }>(url, { code, review, rating: +rating }, { headers });
}


  setStoreActivation(status: boolean): void {
    this.isStoreOpen = status;
    localStorage.setItem('isStoreOpen', status.toString());
  }

  updateShopStatus(shopId: string, status: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${shopId}/status`, { statusShop: status });
  }
}
