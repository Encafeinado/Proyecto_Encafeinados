import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Método para agregar una nueva review
  addReview(review: string): Observable<any> {
    const body = { review }; // El cuerpo de la solicitud

    return this.http.post<any>(`${this.apiUrl}/review/register`, body).pipe(
      catchError((error) => {
        console.error('Error al agregar la review:', error);
        return throwError(() => error);
      })
    );
  }

  // Método para obtener todas las reviews
  getAllReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/review/allReviews`).pipe(
      catchError((error) => {
        console.error('Error al obtener todas las reviews:', error);
        return throwError(() => error);
      })
    );
  }
}
