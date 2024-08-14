import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'encafeinados4@gmail.com',
      pass: 'tsaa ypua hfpi mnea',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  async sendPasswordResetMail(email: string, token: string): Promise<void> {
    //const resetLink = `http://localhost:4200/#/auth/reset-password?token=${token}`;
    const resetLink = `https://www.encafeinados.club/#/auth/reset-password?token=${token}`;
    console.log('Sending reset link:', resetLink); // Verifica la URL generada

    await this.transporter.sendMail({
      from: '"Encafeinados" <encafeinados4@gmail.com>',
      to: email,
      subject: 'Restablecer contraseña',
      html: `
        <p>Bienvenido a Encafeinados. Has solicitado un cambio de contraseña. Por favor, haz clic en el siguiente botón para restablecer tu contraseña:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #03AED2; border-radius: 5px; text-decoration: none;">Restablecer Contraseña</a>
        <p>Si no has solicitado un cambio de contraseña, por favor ignora este correo.</p>
      `,
    });
  }
}
