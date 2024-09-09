import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterReviewDto {
  @IsString()
  @IsNotEmpty()  // Asegúrate de que el campo no esté vacío
  review: string;
}
