import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class CreateBookDto {
  @IsString()
  nameShop: string;

  @IsString()
  nameUser: string;

  @IsString()
  code: string;

  @IsBoolean()
  status: boolean;

  @IsArray()
  @IsOptional()
  images?: { url: string }[];
}
