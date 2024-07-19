import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, catchError, map, of, throwError } from 'rxjs';
import { AuthStatus, CheckTokenResponse, LoginResponse, User } from '../interfaces';
import { environment } from 'src/environments/environments';
import { Shop } from 'src/app/features/store/interfaces/shop.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl: string = environment.baseUrl;

  private http = inject(HttpClient);

  private _currentUser = signal<User | Shop | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public rolUser: string | null = null;

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
    this.rolUser = role;
    return true;
  }

  login(email: string, password: string, isShop: boolean): Observable<any> {
    const url = isShop ? `${this.baseUrl}/shop/login` : `${this.baseUrl}/auth/login`;
    const body = { email, password };
  
    return this.http.post<any>(url, body).pipe(
      map(response => {
        const { user, shop, token } = response;
  
        // Determina el tipo de autenticación basado en la respuesta
        if (user) {
          
          return this.setAuthentication(user, token, 'user');
        } else if (shop) {
      
          return this.setAuthentication(shop, token, 'shop');
        } else {
          throw new Error('Respuesta inesperada del servidor.');
        }
      }),
      catchError(err => {
        console.error('Error al iniciar sesión:', err);
        return throwError(() => new Error(err.error.message));
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

    // Primero intenta verificar como user
    return this.http.get<CheckTokenResponse>(url, { headers }).pipe(
      map(({ user, token }) => {
        if (user) {
          this.setAuthentication(user, token, 'user');
          return true;
        } else {
          throw new Error('Token de usuario no válido.');
        }
      }),
      catchError(() => {
        // Si falla como user, intenta como shop
        return this.http.get<CheckTokenResponse>(url2, { headers }).pipe(
          map(({ shop, token }) => {
            if (shop) {
              this.setAuthentication(shop, token, 'shop');
              return true;
            } else {
              throw new Error('Token de tienda no válido.');
            }
          }),
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
    this.rolUser = null;
  }
}
