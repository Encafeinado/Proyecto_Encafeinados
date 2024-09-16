import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, InternalServerErrorException, HttpCode, HttpStatus } from '@nestjs/common';
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
      return { message: 'Código de verificación actualizado' };
    } else {
      return { message: 'Código de verificación no aceptado' };
    }
  }
  
// shop.controller.ts
@UseGuards(AuthGuard)
@Post('/verify-code')
async verifyCodeByUser(
  @Body() verifyCodeDto: VerifyCodeDto,
  @Request() req: RequestWithUser
) {
  const userId = req.user.id; // Obtén el ID del usuario desde el token JWT
  const { code, review, rating } = verifyCodeDto; // Extrae review y rating
  const result = await this.shopService.verifyVerificationCodeByCodeAndAddCoins(code, userId, review, rating);
  return result;
}


  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.shopService.login(loginDto);
  }


  @Get('/allShops')
  findAllShops(@Request() req: Request) {
    return this.shopService.findAll();
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


  
  @Post('validate-password')
  @HttpCode(HttpStatus.OK)
  async validatePassword(@Body() body: { email: string; password: string }): Promise<{ valid: boolean }> {
    const { email, password } = body;
    const isValid = await this.shopService.validatePassword(email, password);
    return { valid: isValid };
  }
  

  @Post('/check-email-existence')
  async checkEmailExistence(@Body('email') email: string): Promise<{ message: string }> {
    try {
      const exists = await this.shopService.checkEmailExistence(email);
      return { message: exists ? 'Email is registered' : 'Email is not registered' };
    } catch (error) {
      throw new InternalServerErrorException('Error al verificar el correo.');
    }
  }

  @Get(':id')
  async getShopById(@Param('id') shopId: string): Promise<ShopDocument> {
    return this.shopService.findShopById(shopId);
  }

  @Patch(':id/status')
  updateShopStatus(
    @Param('id') id: string,
    @Body('statusShop') statusShop: boolean
  ) {
    return this.shopService.updateShopStatus(id, statusShop);
  }
}
