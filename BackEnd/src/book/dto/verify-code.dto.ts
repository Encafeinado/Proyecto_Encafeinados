import { IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  nameShop: string;

  @IsString()
  nameUser: string;

  @IsString()
  code: string;

  @IsString()
  imageUrl: string;
}
