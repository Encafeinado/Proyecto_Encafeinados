import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './shop.service';
import { CreateShopDto, LoginDto, RegisterShopDto, UpdateAuthDto } from './dto';
import { Shop } from './entities/shop.entity';
import { LoginResponce } from './interfaces/login-responce';
import { AuthGuard } from './guards/auth.guard';



@Controller('shop')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.authService.create(createShopDto);
  }


  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/registerShop')
  register(@Body() registerDto: RegisterShopDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req: Request) {
    //const user = req['user'];
    //return user;
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponce{
    
    const shop = req['shop'] as Shop;

    return {
      shop,
      token: this.authService.getJwtToken( {id: shop._id})
    }

  }

  //@Get(':id')
  //findOne(@Param('id') id: string) {
   // return this.authService.findOne(+id);
  //}

  //@Patch(':id')
  //update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    //return this.authService.update(+id, updateAuthDto);
  //}

  //@Delete(':id')
  //remove(@Param('id') id: string) {
    //return this.authService.remove(+id);
  //}
}
