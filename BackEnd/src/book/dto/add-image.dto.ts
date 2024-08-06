import { IsString } from 'class-validator';

export class AddImageDto {
  @IsString()
  code: string; // Código para asociar la imagen

  @IsString()
  name: string; // Nombre de la tienda

  @IsString()
  image: Buffer; // Imagen en formato base64 (o Buffer si se usa otro tipo de almacenamiento)
}
