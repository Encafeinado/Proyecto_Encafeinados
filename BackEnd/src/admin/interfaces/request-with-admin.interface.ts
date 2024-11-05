// request-with-user.interface.ts
import { Request } from 'express';
import { AdminDocument } from '../entities/admin.entity';

export interface RequestWithUser extends Request {
  admin: AdminDocument & { id: string }; // Asegúrate de que id es un string
}
