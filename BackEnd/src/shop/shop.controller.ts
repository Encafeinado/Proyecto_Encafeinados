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
  register(@Body() registerDto: RegisterShopDto) {
    return this.shopService.register(registerDto);
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
