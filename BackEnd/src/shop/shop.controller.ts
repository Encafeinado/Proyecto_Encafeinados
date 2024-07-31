// shop.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ShopService } from './shop.service';
import { RegisterShopDto, LoginDto, VerifyCodeDto } from './dto';
import { ShopDocument } from './entities/shop.entity'; // Importa ShopDocument
import { LoginResponce } from './interfaces/login-responce';
import { ShopGuard } from './guards/shop.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterShopDto) {
    const logoBase64 = registerDto.logo; // Suponiendo que el logo viene como base64 en el DTO
    const shop = await this.shopService.create(registerDto, logoBase64);

    return {
      shop,
      message: 'Tienda registrada exitosamente',
    };
  }

  @Post('/verify/:id')
  async verifyCode(@Param('id') shopId: string, @Body() verifyCodeDto: VerifyCodeDto) {
    const { code } = verifyCodeDto;
    const isValid = await this.shopService.verifyVerificationCode(shopId, code);

    if (isValid) {
      return { message: 'Código de verificación válido' };
    } else {
      return { message: 'Código de verificación no aceptado' };
    }
  }
  
  @UseGuards(AuthGuard)
  @Post('/verify-code')
  async verifyCodeByUser(@Body() verifyCodeDto: VerifyCodeDto, @Request() req: RequestWithUser) {
    console.log('Request user:', req.user); // Añade esta línea
    const userId = req.user.id; // Obtén el ID del usuario desde el token JWT
    const result = await this.shopService.verifyVerificationCodeByCodeAndAddCoins(verifyCodeDto.code, userId);
    return result; // Devuelve el resultado tal cual
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.shopService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req: Request) {
    return this.shopService.findAll();
  }

  @UseGuards(ShopGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponce {
    const shop = req['shop'] as ShopDocument; // Usa ShopDocument aquí
    return {
      shop,
      token: this.shopService.getJwtToken({ id: shop._id.toString() }), // Convierte _id a cadena
    };
  }

  @Get(':id')
  async getShopById(@Param('id') shopId: string): Promise<ShopDocument> {
    return this.shopService.findShopById(shopId);
  }
}
