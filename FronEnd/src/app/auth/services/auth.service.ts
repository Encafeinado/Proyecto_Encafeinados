import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
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
    localStorage.setItem('shopId', role === 'shop' ? (userOrShop as Shop)._id : '');
    localStorage.setItem('userId', role === 'user' ? (userOrShop as User)._id : '');
    this.rolUser.set(role);

    return true;
  }


  
  login(email: string, password: string): Observable<boolean> {
    const urlStore = `${this.baseUrl}/shop/login`;
    const urlUser = `${this.baseUrl}/auth/login`;
  
    const body = { email, password };
    return this.http.post<LoginResponse>(urlUser, body).pipe(
      map(({ user, token }) => this.setAuthentication(user, token, 'user')),
      catchError((error: HttpErrorResponse) => {
        // Imprimir el error para depuración
        console.log('Login error:', error);
  
        return this.http.post<LoginResponse>(urlStore, body).pipe(
          map(({ shop, token }) => this.setAuthentication(shop, token, 'shop')),
          catchError((err: HttpErrorResponse) => {
            // Aquí debemos asegurarnos de lanzar un error con el mensaje adecuado
            return throwError(() => new Error(err.error.message || 'Error desconocido'));
          })
        );
      })
    );
  }
  
  
  checkEmailAvailability(email: string): Observable<boolean> {
    return this.http.post<{ available: boolean }>(`${this.baseUrl}/auth/check-email-availability`, { email })
      .pipe(
        map(response => response.available),
        catchError(() => of(false)) // En caso de error, devuelve false
      );
  }

  checkEmailExistence(email: string): Observable<{ emailNotRegistered: boolean } | null> {
    const authCheck = this.http.post<{ message: string }>(`${this.baseUrl}/auth/check-email-existence`, { email });
    const shopCheck = this.http.post<{ message: string }>(`${this.baseUrl}/shop/check-email-existence`, { email });

    return forkJoin([authCheck, shopCheck]).pipe(
      map(([authResponse, shopResponse]) => {
        // Si ambos servicios dicen que el correo no está registrado, retornar el error
        if (authResponse.message === 'Email is not registered' && shopResponse.message === 'Email is not registered') {
          return { emailNotRegistered: true };
        }
        return null; // El correo está registrado en al menos una de las dos URL
      }),
      catchError(() => of(null)) // Manejo de errores
    );
  }
  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, { token, password }).pipe(
      map(response => {
      
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al restablecer la contraseña:', error);
        return throwError(() => new Error('Error al restablecer la contraseña. Por favor, inténtelo de nuevo.'));
      })
    );
  }

  // auth.service.ts
/// En AuthService
validatePassword(email: string, password: string): Observable<{ valid: boolean }> {
  const authCheck = this.http.post<{ valid: boolean }>(`${this.baseUrl}/auth/validate-password`, { email, password });
  const shopCheck = this.http.post<{ valid: boolean }>(`${this.baseUrl}/shop/validate-password`, { email, password });

  return forkJoin([authCheck, shopCheck]).pipe(
    map(([authResponse, shopResponse]) => {
      // Si al menos uno de los servicios dice que la contraseña es válida
      if (authResponse.valid || shopResponse.valid) {
        return { valid: true };
      }
      return { valid: false };
    }),
    catchError(() => of({ valid: false })) // Manejo de errores
  );
}

isAuthenticated(): boolean {
  return !!this.currentUser();
}


  register(name: string, email: string, password: string, phone: string): Observable<boolean> {
    const url = `${this.baseUrl}/auth/register`;
    const body = { name, email, password, phone };

    return this.http.post<LoginResponse>(url, body).pipe(
      map(({ user, token }) => this.setAuthentication(user!, token, 'user')),
      catchError(err => throwError(() => err.error.message))
    );
  }

  registerStore(
    name: string,
    email: string,
    password: string,
    phone: string,
    specialties1: string,
    specialties2: string,
    address: string,
    logo: string,
    latitude: number,
    longitude: number,
    statusShop: boolean
    ): Observable<boolean> {
    const url = `${this.baseUrl}/shop/register`;
    const body = { name, email, password, phone, specialties1, specialties2, address, logo, latitude, longitude, statusShop };
  
    return this.http.post<LoginResponse>(url, body).pipe(
      map(({ shop, token }) => this.setAuthentication(shop!, token, 'shop')),
      catchError(err => throwError(() => err.error.message))
    );
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-token`;
    const url2 = `${this.baseUrl}/shop/check-token`;
    const token = localStorage.getItem('token');
    const currentUrl = window.location.href; // Obtener la URL actual
  
    if (currentUrl.includes('/auth/reset-password')) {
      this._authStatus.set(AuthStatus.verify);
      return of(true); // Permitir el acceso si está en la página de restablecimiento de contraseña
    }
  
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
    localStorage.removeItem('shopId');
    localStorage.removeItem('userId');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
    this.rolUser.set(null);
  }

  getShopId(): string | null {
    console.log(localStorage.getItem('shopId'))
    return localStorage.getItem('shopId');
  }

  getUserId(): string | null {
    console.log(localStorage.getItem('userId'))
    return localStorage.getItem('userId');
  }
}
