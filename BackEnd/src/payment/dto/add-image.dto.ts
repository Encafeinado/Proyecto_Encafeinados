import { IsString } from 'class-validator';

export class AddImageDto {
 
  @IsString()
  image: string; // Imagen en formato base64
}
