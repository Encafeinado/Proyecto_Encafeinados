import { User } from "../entities/user.entity";

export interface LoginResponce{
    user:User 
    token:string;
}