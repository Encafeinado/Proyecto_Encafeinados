import { Shop } from "../entities/shop.entity";

export interface LoginResponce{
    shop:Shop 
    token:string;
}