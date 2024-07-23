import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Shop } from 'src/app/features/store/interfaces/shop.interface';
import { environment } from 'src/environments/environments';
import { AuthStatus, CheckTokenResponse, LoginResponse, User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.baseUrl;
  
  private http = inject(HttpClient);

  private _currentUser = signal<User | Shop | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public rolUser = signal<string | null>(null);

  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());
  public userRole = computed(() => this.rolUser); 

  constructor() {
    this.checkAuthStatus().subscribe();
  }

  private setAuthentication(userOrShop: User | Shop, token: string, role: string): boolean {
    this._currentUser.set(userOrShop);
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem('token', token);
    this.rolUser.set(role);

    
    return true;
  }

  logine(email: string, password: string): Observable<boolean> {
    const urlStore = `${this.baseUrl}/shop/login`;
    const urlUser = `${this.baseUrl}/auth/login`;
    
    const body = { email, password };
    return this.http.post<LoginResponse>(urlUser, { email, password }).pipe(
      map(({ user, token }) => this.setAuthentication(user, token, 'user')),
      catchError((error: HttpErrorResponse) => {
        return this.http.post<LoginResponse>(urlStore, { email, password }).pipe(
          map(({ shop, token }) => this.setAuthentication(shop, token, 'shop')),
          catchError((err: HttpErrorResponse) => {
            return of(false);
          })
        );
      })
    );
  }

  register(name: string, email: string, password: string, phone: string): Observable<boolean> {
    const url = `${this.baseUrl}/auth/register`;
    const body = { name, email, password, phone };

    return this.http.post<LoginResponse>(url, body).pipe(
      map(({ user, token }) => this.setAuthentication(user!, token, 'user')),
      catchError(err => throwError(() => err.error.message))
    );
  }

  registerStore(name: string, email: string, password: string, phone: string, specialties: string, address: string, logo: string): Observable<boolean> {
    const url = `${this.baseUrl}/shop/register`;
    const body = { name, email, password, phone, specialties, address, logo };

    return this.http.post<LoginResponse>(url, body).pipe(
      map(({ shop, token }) => this.setAuthentication(shop!, token, 'shop')),
      catchError(err => throwError(() => err.error.message))
    );
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-token`;
    const url2 = `${this.baseUrl}/shop/check-token`;
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return of(false);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<CheckTokenResponse>(url, { headers }).pipe(
      map(({ user, token }) => this.setAuthentication(user!, token, 'user')),
      catchError(err => {
        return this.http.get<CheckTokenResponse>(url2, { headers }).pipe(
          map(({ shop, token }) => this.setAuthentication(shop!, token, 'shop')),
          catchError(innerErr => {
            console.error('Error al verificar el token', innerErr);
            this._authStatus.set(AuthStatus.notAuthenticated);
            this.logout();
            return of(false);
          })
        );
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
    this.rolUser.set(null);
  }
}
