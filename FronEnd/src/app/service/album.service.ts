// src/app/services/album.service.ts
import { Injectable } from '@angular/core';

export interface Image {
  src: string;
  alt: string;
  info: string;
  colored: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private albumImages: Image[] = [
    { src: 'assets/images/1.jpeg', alt: 'Imagen 1', info: 'Información sobre la imagen 1', colored: false },
    { src: 'assets/images/2.jpeg', alt: 'Imagen 2', info: 'Información sobre la imagen 2', colored: false },
    { src: 'assets/images/3.jpeg', alt: 'Imagen 3', info: 'Información sobre la imagen 3', colored: false },
    { src: 'assets/images/4.jpeg', alt: 'Imagen 4', info: 'Información sobre la imagen 4', colored: false },
    { src: 'assets/images/5.jpeg', alt: 'Imagen 5', info: 'Información sobre la imagen 5', colored: false },
    { src: 'assets/images/6.jpeg', alt: 'Imagen 6', info: 'Información sobre la imagen 6', colored: false },
    { src: 'assets/images/1.jpeg', alt: 'Imagen 7', info: 'Información sobre la imagen 7', colored: false },
    { src: 'assets/images/2.jpeg', alt: 'Imagen 8', info: 'Información sobre la imagen 8', colored: false },
    { src: 'assets/images/3.jpeg', alt: 'Imagen 9', info: 'Información sobre la imagen 9', colored: false },
    { src: 'assets/images/4.jpeg', alt: 'Imagen 10', info: 'Información sobre la imagen 10', colored: false },
    { src: 'assets/images/5.jpeg', alt: 'Imagen 11', info: 'Información sobre la imagen 11', colored: false },
    { src: 'assets/images/6.jpeg', alt: 'Imagen 12', info: 'Información sobre la imagen 12', colored: false },
    { src: 'assets/images/1.jpeg', alt: 'Imagen 13', info: 'Información sobre la imagen 13', colored: false },
    { src: 'assets/images/2.jpeg', alt: 'Imagen 14', info: 'Información sobre la imagen 14', colored: false },
    { src: 'assets/images/3.jpeg', alt: 'Imagen 15', info: 'Información sobre la imagen 15', colored: false },
    { src: 'assets/images/4.jpeg', alt: 'Imagen 16', info: 'Información sobre la imagen 16', colored: false },
    { src: 'assets/images/5.jpeg', alt: 'Imagen 17', info: 'Información sobre la imagen 17', colored: false },
    { src: 'assets/images/6.jpeg', alt: 'Imagen 18', info: 'Información sobre la imagen 18', colored: false },
    { src: 'assets/images/1.jpeg', alt: 'Imagen 19', info: 'Información sobre la imagen 19', colored: false },
    { src: 'assets/images/2.jpeg', alt: 'Imagen 20', info: 'Información sobre la imagen 20', colored: false },
    { src: 'assets/images/3.jpeg', alt: 'Imagen 21', info: 'Información sobre la imagen 21', colored: false },
    { src: 'assets/images/4.jpeg', alt: 'Imagen 22', info: 'Información sobre la imagen 22', colored: false },
    { src: 'assets/images/5.jpeg', alt: 'Imagen 23', info: 'Información sobre la imagen 23', colored: false },
    { src: 'assets/images/6.jpeg', alt: 'Imagen 24', info: 'Información sobre la imagen 24', colored: false },
    { src: 'assets/images/1.jpeg', alt: 'Imagen 25', info: 'Información sobre la imagen 25', colored: false },
    { src: 'assets/images/2.jpeg', alt: 'Imagen 26', info: 'Información sobre la imagen 26', colored: false },
    { src: 'assets/images/3.jpeg', alt: 'Imagen 27', info: 'Información sobre la imagen 27', colored: false },
    { src: 'assets/images/4.jpeg', alt: 'Imagen 28', info: 'Información sobre la imagen 28', colored: false },
    { src: 'assets/images/5.jpeg', alt: 'Imagen 29', info: 'Información sobre la imagen 29', colored: false },
    { src: 'assets/images/6.jpeg', alt: 'Imagen 30', info: 'Información sobre la imagen 30', colored: false },
  ];

  getAlbumImages(): Image[] {
    return this.albumImages;
  }

  changeImagesToBlue(): void {
    this.albumImages.forEach((image) => {
      image.colored = true;
    });
  }
}