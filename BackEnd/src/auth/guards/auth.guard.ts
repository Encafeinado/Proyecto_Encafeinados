import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';
import { ShopService } from 'src/shop/shop.service';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private shopService: ShopService, // Agrega el ShopService
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No hay token en la petición');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token, { secret: process.env.JWT_SEED }
      );
      
      // Intenta encontrar primero como usuario
      let user = await this.authService.findUserById(payload.id);
      if (!user) {
        // Si no es usuario, intenta como tienda
        const shop = await this.shopService.findShopById(payload.id);
        if (!shop) throw new UnauthorizedException('El usuario/tienda no existe');
        if (!shop.isActive) throw new UnauthorizedException('El usuario/tienda no está activo');

        request['shop'] = shop;
      } else {
        if (!user.isActive) throw new UnauthorizedException('El usuario no está activo');
        request['user'] = user;
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
