import { Shop } from 'src/app/features/store/interfaces/shop.interface';
import { User } from './user.interface';
import { Admin } from './admin.interface';

export interface CheckTokenResponse {
  shop:Shop;
  user:  User;
  admin:Admin;
  token: string;
}

