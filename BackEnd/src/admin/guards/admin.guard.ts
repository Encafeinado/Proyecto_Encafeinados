import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(
    private jwtService: JwtService,
    private adminService: AdminService,
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
      // Verificar el token con la clave secreta
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SEED });
      
      // Buscar el administrador por ID desde el payload
      const admin = await this.adminService.findAdminById(payload.id);

      if (!admin) {
        this.logger.error('El administrador no existe');
        throw new UnauthorizedException('El administrador no existe');
      }

      if (!admin.isActive) {
        this.logger.error('El administrador no está activo');
        throw new UnauthorizedException('El administrador no está activo');
      }

      // Adjuntar el administrador verificado a la solicitud
      request.user = { ...admin, id: admin._id?.toString() }; // Convertir _id a string solo si existe
    } catch (error) {
      this.logger.error('Error al verificar el token', error.message);
      throw new UnauthorizedException('Token no válido');
    }

    return true;
  }

  // Extraer el token del encabezado de la petición
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    }
    return undefined;
  }
}