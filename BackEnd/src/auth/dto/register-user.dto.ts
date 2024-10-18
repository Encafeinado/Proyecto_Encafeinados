import { IsEmail, IsString, MinLength, IsIn } from "class-validator";
import { IsCellPhone } from '../decorators/is-cell-phone.decorator';
export class RegisterUserDto {

    @IsEmail()
    email: string;
    @IsString()
    name: string;

    @IsCellPhone()
    phone: number;
    
    @MinLength(6)
    password: string;

    @IsString()
    @IsIn(['Local', 'Extranjero'], { message: 'Procedencia debe ser "local" o "extranjero".' })
    origin: string;
}
