import { Admin } from './admin.interface';



export interface LoginAdminResponse {

  admin: Admin;
  token: string;
}

