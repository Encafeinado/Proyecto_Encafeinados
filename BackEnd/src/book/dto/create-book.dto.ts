import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateBookDto {
  @IsString()
  nameUser: string; // Nombre del usuario es obligatorio

  @IsArray()
  @IsOptional()
  images?: { code: string; name: string; image: string }[]; // Ajustado para contener código, nombre e imagen
}
