import { Admin } from "../entities/admin.entity";

export interface LoginResponce{
    admin:Admin 
    token:string;
}