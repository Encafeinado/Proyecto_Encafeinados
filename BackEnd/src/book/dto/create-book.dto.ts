import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class CreateBookDto {
  @IsString()
  nameShop: string;

  @IsString()
  nameUser: string;

  @IsString()
  code: string;

  @IsArray()
  @IsOptional()
  images?: { url: string }[];
}
