import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber, IsLatitude, IsLongitude } from 'class-validator';
import { IsCellPhone } from '../decorators/is-cell-phone.decorator';
import { IsBoolean } from 'class-validator';

export class RegisterShopDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsCellPhone()
  phone: string;
  
  @MinLength(6)
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  specialties1: string;

  @IsNotEmpty()
  @IsString()
  specialties2: string;

  @IsNotEmpty()
  @IsString()
  address: string;
  
  @IsNotEmpty()
  @IsString()
  logo: string;

  @IsNotEmpty()
  @IsLatitude()
  latitude: number; // Nuevo campo para latitud

  @IsNotEmpty()
  @IsLongitude()
  longitude: number; // Nuevo campo para longitud

  @IsNotEmpty()
  @IsBoolean()
  statusShop: boolean;
}
