import { User } from './user.interface';
import { Shop } from '../../features/store/interfaces/shop.interface';



export interface LoginResponse {
  shop: Shop;
  user:  User;
  token: string;
}

