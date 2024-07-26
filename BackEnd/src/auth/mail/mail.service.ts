import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';



@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes usar otro servicio de correo
    auth: {
      user: 'encafeinados4@gmail.com',
      pass: 'tsaa ypua hfpi mnea',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  async sendPasswordResetMail(email: string, token: string): Promise<void> {
    const resetLink = `http://localhost:4200/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: '"Encafeinados" <encafeinados4@gmail.com>',
      to: email,
      subject: 'Restablecer contraseña',
      text: `Bienvenido a Encafeinados has solicitado un cambio de contraseña porfavor Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`, 
    });
  }
}
