import { IsEmail,IsIn,IsString, MinLength } from "class-validator";
import { IsCellPhone } from '../decorators/is-cell-phone.decorator';

export class CreateUserDto {

    @IsEmail()
    email: string;
    @IsString()
    name: string;

    @IsCellPhone()
    phone: number;

    @MinLength(4)
    password: string;

    @IsString()
    @IsIn(['Local', 'Extranjero'], { message: 'Procedencia debe ser "Local" o "Extranjero".' })
    origin: string;
}
