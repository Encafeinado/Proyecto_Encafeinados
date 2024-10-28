import { IsEmail,IsString, MinLength } from "class-validator";
import { IsCellPhone } from '../decorators/is-cell-phone.decorator';

export class CreateAdminDto {

    @IsEmail()
    email: string;
    @IsString()
    name: string;

    @IsCellPhone()
    phone: number;

    @MinLength(6)
    password: string;
}
