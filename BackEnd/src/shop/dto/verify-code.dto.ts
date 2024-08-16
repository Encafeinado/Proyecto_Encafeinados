import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class VerifyCodeDto {
    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    review?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;
}
