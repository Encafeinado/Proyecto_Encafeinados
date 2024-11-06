import { IsString, IsBoolean, IsNumber, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  nameShop: string; // Nombre de la tienda

  @IsString()
  @IsNotEmpty()
  shopId: string; // ID de la tienda

  @IsNumber()
  @IsNotEmpty()
  amount: number; // valor del pago


  @IsBoolean()
  @IsNotEmpty()
  statusPayment: boolean; // Estado del pago

  @IsNumber()
  @IsNotEmpty()
  year: number; // Año del pago

  @IsNumber()
  @IsNotEmpty()
  month: number; // Mes del pago (1-12)

  @IsArray()
  images: {
    image: string; // Imagen en formato base64
  }[];
}
