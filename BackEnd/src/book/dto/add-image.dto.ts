import { IsString } from 'class-validator';

export class AddImageDto {
  @IsString()
  url: string;
}
