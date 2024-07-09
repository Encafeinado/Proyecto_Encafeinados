import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ShopService } from './shop.service';
import { RegisterShopDto, LoginDto } from './dto';
import { Shop } from './entities/shop.entity';
import { LoginResponce } from './interfaces/login-responce';
import { AuthGuard } from './guards/shop.guard';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('/register')
    async register(@Body() registerDto: RegisterShopDto) {
        // Aquí podrías manejar la carga del logo en base64 si lo deseas
        const logoBase64 = registerDto.logo; // Suponiendo que el logo viene como base64 en el DTO
        const shop = await this.shopService.create(registerDto, logoBase64);

        return {
            shop,
            message: 'Tienda registrada exitosamente',
        };
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

  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponce {
    const shop = req['shop'] as Shop;
    return {
      shop,
      token: this.shopService.getJwtToken({ id: shop._id }),
    };
  }
}
