import { Shop } from 'src/app/features/store/interfaces/shop.interface';
import { User } from './user.interface';

export interface CheckTokenResponse {
  shop:Shop;
  user:  User;
  token: string;
}

