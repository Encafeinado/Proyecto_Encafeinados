import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { ShopService } from '../shop.service';

@Injectable()
export class ShopGuard  implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private shopService: ShopService,
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
      
      const shop = await this.shopService.findShopById(payload.id);
      if (!shop) throw new UnauthorizedException('El usuario no existe');
      if (!shop.isActive) throw new UnauthorizedException('El usuario no está activo');

      request['shop'] = shop;
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
