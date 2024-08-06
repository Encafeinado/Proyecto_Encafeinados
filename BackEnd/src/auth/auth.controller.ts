import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, RegisterUserDto } from './dto';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponce } from './interfaces/login-responce';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<void> {
    try {
      await this.authService.sendPasswordResetToken(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Correo electrónico no registrado');
      } else {
        throw new InternalServerErrorException('Error al enviar el correo de restablecimiento');
      }
    }
  }
  

  
  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }


  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterUserDto) {
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
    
    const user = req['user'] as User;

    return {
      user,
      token: this.authService.getJwtToken( {id: user._id})
    }

  }

  @UseGuards(AuthGuard)
  @Get('user-id')
  getUserId(@Request() req: Request): { userId: string } {
    const user = req['user'] as User;
    return { userId: user._id.toString() }; // Asegúrate de que _id sea convertido a string si es necesario
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
   return this.authService.findOne(+id);
  }

  //@Patch(':id')
  //update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    //return this.authService.update(+id, updateAuthDto);
  //}

  //@Delete(':id')
  //remove(@Param('id') id: string) {
    //return this.authService.remove(+id);
  //}
}
