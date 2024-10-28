import { Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginDto,  } from './dto';
import { Admin } from './entities/admin.entity';
import { LoginResponce } from './interfaces/login-responce';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  

  @Get('Admin') // Nueva ruta para obtener todos los usuarios
  async getAllAdmin(): Promise<Admin[]> {
    return this.adminService.findAll();
  }
  
  


  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.adminService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterAdminDto) {
    return this.adminService.register(registerDto);
  }


  @Post('validate-password')
  @HttpCode(HttpStatus.OK)
  async validatePassword(@Body() body: { email: string; password: string }): Promise<{ valid: boolean }> {
    const { email, password } = body;
    const isValid = await this.adminService.validatePassword(email, password);
    return { valid: isValid };
  }

 
 // @UseGuards(AdminGuard)
  @Get()
  findAll(@Request() req: Request) {
    //const Admin = req['Admin'];
    //return Admin;
    return this.adminService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponce {
    // Cambiar req['admin'] a req['user']
    const admin = req['user'] as Admin;
  
    // Asegúrate de que admin no es undefined antes de generar el token
    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
    }
  
    return {
      admin,
      token: this.adminService.getJwtToken({ id: admin._id })
    };
  }
  

  //@UseGuards(AdminGuard)
  @Get('Admin-id')
  getAdminId(@Request() req: Request): { AdminId: string } {
    const Admin = req['Admin'] as Admin;
    return { AdminId: Admin._id.toString() }; // Asegúrate de que _id sea convertido a string si es necesario
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
   return this.adminService.findOne(+id);
  }
}
