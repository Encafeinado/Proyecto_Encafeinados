import { IsEmail, IsString, MinLength } from "class-validator";
import { IsCellPhone } from '../decorators/is-cell-phone.decorator';
export class RegisterShopDto {

    @IsEmail()
    email: string;
    @IsString()
    name: string;

    @IsCellPhone()
    phone: string;
    
    @MinLength(6)
    password: string;
}
