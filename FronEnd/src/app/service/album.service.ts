// album.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environments';

export interface Image {
  logoUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private bookUrl = `${environment.baseUrl}/book`;

  constructor(private http: HttpClient) {}

  getBookData(userId: string): Observable<Image[]> {
    const url = `${this.bookUrl}/user/${userId}`;
    return this.http.get<{ images: any[] }>(url).pipe(
      map((response) =>
        response.images.map((image) => ({
          logoUrl: `data:application/octet-stream;base64,${this.arrayBufferToBase64(image.image.data)}`,
        }))
      )
    );
  }

  private arrayBufferToBase64(buffer: any): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}