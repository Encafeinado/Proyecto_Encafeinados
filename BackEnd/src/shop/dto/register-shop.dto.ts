import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsCellPhone } from '../decorators/is-cell-phone.decorator';

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
  specialties: string;

  @IsNotEmpty()
  @IsString()
  address: string;
  
  @IsNotEmpty()
  @IsString()
  logo: string; 
}

