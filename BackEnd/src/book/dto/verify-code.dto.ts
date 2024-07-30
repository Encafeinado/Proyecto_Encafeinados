import { IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  nameShop: string;

  @IsString()
  nameUser: string;

  
  @IsString()
  imageUrl: string;

  @IsString()
  code: string;

}
