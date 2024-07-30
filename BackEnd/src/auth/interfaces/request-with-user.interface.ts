// request-with-user.interface.ts
import { Request } from 'express';
import { UserDocument } from '../entities/user.entity';

export interface RequestWithUser extends Request {
  user: UserDocument & { id: string }; // Asegúrate de que id es un string
}
