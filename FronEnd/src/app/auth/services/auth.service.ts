import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environments';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { AuthStatus, CheckTokenResponse, LoginResponse, User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environment.baseUrl;
  private http = inject(HttpClient);

  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);

  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  public rolUser? : string 

  constructor() {
    this.checkAuthStatus().subscribe();
  }

  private setAuthentication(user: User, token: string): boolean {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem('token', token);
    return true;
  }

  login(email: string, password: string): Observable<boolean> {
    const urlUser = `${this.baseUrl}/auth/login`;
    const urlStore = `${this.baseUrl}/shop/login`;
    const body = { email, password };
  
    return this.loginAsUser(urlUser, body).pipe(
      catchError(err => {
        console.log('User login failed, trying shop login', err);
        return this.loginAsShop(urlStore, body);
      })
    );
  }
  
  private loginAsUser(url: string, body: any): Observable<boolean> {
    this.rolUser = "user";
    console.log(this.rolUser);
    return this.http.post<LoginResponse>(url, body).pipe(
      map(({ user, token }) => this.setAuthentication(user, token))
    );
  }
  
  private loginAsShop(url: string, body: any): Observable<boolean> {
    this.rolUser = "shop";
    console.log(this.rolUser);
    return this.http.post<LoginResponse>(url, body).pipe(
      map(({ user, token }) => this.setAuthentication(user, token)),
      catchError(err => throwError(() => new Error('Shop login failed')))
    );
  }
  

  register(name: string, email: string, password: string, phone: string): Observable<boolean> {
    const url = `${this.baseUrl}/auth/register`;
    const body = { name, email, password, phone };

    return this.http.post<LoginResponse>(url, body).pipe(
      map(({ user, token }) => this.setAuthentication(user, token)),
      catchError(err => throwError(() => err.error.message))
    );
  }

  registerStore(name: string, email: string, password: string, phone: string, specialties: string, address: string, logo: string): Observable<boolean> {
    const url = `${this.baseUrl}/shop/register`;
    const body = { name, email, password, phone, specialties, address,logo };

    return this.http.post<LoginResponse>(url, body).pipe(
      map(({ user, token }) => this.setAuthentication(user, token)),
      catchError(err => throwError(() => err.error.message))
    );
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-token`;
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return of(false);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<CheckTokenResponse>(url, { headers }).pipe(
      map(({ user, token }) => this.setAuthentication(user, token)),
      catchError(err => {
        console.error('Error al verificar el token', err);
        this._authStatus.set(AuthStatus.notAuthenticated);
        this.logout();  // Asegura que se desloguee si el token no es válido
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
  }
}