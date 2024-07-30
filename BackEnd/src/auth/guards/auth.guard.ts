// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { ShopService } from 'src/shop/shop.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private shopService: ShopService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    this.logger.log(`Token recibido: ${token}`);

    if (!token) {
      this.logger.error('No hay token en la petición');
      throw new UnauthorizedException('No hay token en la petición');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SEED });
      let user = await this.authService.findUserById(payload.id);

      if (!user) {
        const shop = await this.shopService.findShopById(payload.id);
        if (!shop) throw new UnauthorizedException('El usuario/tienda no existe');
        if (!shop.isActive) throw new UnauthorizedException('El usuario/tienda no está activo');

        request.user = { ...shop, id: shop._id.toString() }; // Asegúrate de convertir _id a string
      } else {
        if (!user.isActive) throw new UnauthorizedException('El usuario no está activo');
        request.user = { ...user, id: user._id.toString() }; // Asegúrate de convertir _id a string
      }
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
