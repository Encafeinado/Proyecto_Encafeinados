import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name); 

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    this.logger.log(`Token recibido: ${token}`);

    if (!token) {
      this.logger.error('No hay token en la petición');
      throw new UnauthorizedException('No hay token en la petición');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token, { secret: process.env.JWT_SEED }
      );
      this.logger.log(`Payload decodificado: ${JSON.stringify(payload)}`);

      const user = await this.authService.findUserById(payload.id);
      if (!user) {
        this.logger.error('El usuario no existe');
        throw new UnauthorizedException('El usuario no existe');
      }
      if (!user.isActive) {
        this.logger.error('El usuario no está activo');
        throw new UnauthorizedException('El usuario no está activo');
      }

      request['user'] = user;
    } catch (error) {
      this.logger.error('Error al verificar el token', error.message);
      throw new UnauthorizedException('Token no válido');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    }
    return undefined;
  }
}
