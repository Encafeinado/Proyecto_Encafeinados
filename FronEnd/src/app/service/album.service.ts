import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';

export interface Image {
  colored: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private albumImages: Image[] = [];
  private bookUrl = `${environment.baseUrl}/book`;

  constructor(private http: HttpClient) {}

  // Método para obtener los datos del libro desde el backend
  getBookData(userId: string): Observable<Image[]> {
    return this.http.get<{ images: any[] }>(`${this.bookUrl}/user/${userId}`).pipe(
      map((response) =>
        response.images.map((image) => ({
          colored: true, // Inicializa coloreado en true si ya está coloreado en el backend
        }))
      )
    );
  }

  // Método para obtener todas las imágenes del álbum
  getAlbumImages(): Image[] {
    return this.albumImages;
  }

  // Método para colorear todas las imágenes
  changeImagesToBlue(): void {
    this.albumImages.forEach((image) => {
      image.colored = true;
    });
  }

  // Método para contar las imágenes coloreadas
  getObtainedStamps(): number {
    return this.albumImages.filter((image) => image.colored).length;
  }

  // Método para actualizar las imágenes del álbum con datos del backend
  updateAlbumImages(userId: string): Observable<Image[]> {
    return this.getBookData(userId).pipe(
      map((images) => {
        this.albumImages = images;
        return images; // Devuelve las imágenes para que el componente pueda usarlas
      })
    );
  }
}
