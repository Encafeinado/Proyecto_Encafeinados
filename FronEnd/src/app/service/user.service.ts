import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  fetchUserData(token: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/auth`, { headers }).pipe(
      catchError(error => {
        console.error('Error al obtener los datos del usuario:', error);
        return throwError(() => error);
      })
    );
  }
}