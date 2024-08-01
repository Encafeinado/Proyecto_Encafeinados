// store.service.ts
import { Injectable } from '@angular/core';
import { Shop } from '../features/store/interfaces/shop.interface';
import { HttpClient } from '@angular/common/http';
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
    const url = `${this.baseUrl}/verify/${shopId}`;
    return this.http.post<{ message: string }>(url, { code });
  }

  verifyCodeCode(code: string): Observable<{ message: string, shop: Shop }> {
    const url = `${this.baseUrl}/verify-code`;
    return this.http.post<{ message: string, shop: Shop }>(url, { code });
  }

  setStoreActivation(status: boolean): void {
    this.isStoreOpen = status;
    localStorage.setItem('isStoreOpen', status.toString());
  }

  updateShopStatus(shopId: string, status: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${shopId}/status`, { statusShop: status });
  }
}
