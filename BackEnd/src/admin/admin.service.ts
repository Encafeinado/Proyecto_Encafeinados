import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { RegisterAdminDto,LoginDto, CreateAdminDto } from './dto';
import { Admin, AdminDocument } from './entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponce } from './interfaces/login-responce';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    try {
      const { password, ...adminData } = createAdminDto;
      const newAdmin = new this.adminModel({
        password: bcryptjs.hashSync(password, 10),
        ...adminData,
      });
      await newAdmin.save();
      const { password: _, ...admin } = newAdmin.toJSON();
      return admin;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createAdminDto.email} Ya Existe!`);
      }
      throw new InternalServerErrorException('Algo terrible esta sucediendo!!!!');
    }
  }

  async register(registerDto: RegisterAdminDto): Promise<LoginResponce> {
    const admin = await this.create( registerDto );

    return {
      admin: admin,
      token: this.getJwtToken({ id: admin._id })
    }
  }

    
  async login(loginDto: LoginDto): Promise<LoginResponce> {
    const { email, password } = loginDto;
    const admin = await this.adminModel.findOne({ email });

    if (!admin) {
      console.log('Email not found');
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!bcryptjs.compareSync(password, admin.password)) {
      console.log('Password incorrect');
      throw new UnauthorizedException('Credenciales de la contraseña no válidas');
    }

    const { password: _, ...rest } = admin.toJSON();
    return {
      admin: rest,
      token: this.getJwtToken({ id: admin.id }),
    };
  }


 // auth.service.ts
 async validatePassword(email: string, password: string): Promise<boolean> {
  const admin = await this.adminModel.findOne({ email }); // Cambiado de findByEmail a findOne

  if (!admin) {
    return false;
  }

  // Compara la contraseña proporcionada con la almacenada en la base de datos
  return bcryptjs.compare(password, admin.password);
}

  

  findAll(): Promise<Admin[]> {
    return this.adminModel.find();
  }

  async findAdminById(id: string): Promise<AdminDocument> {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return admin.toObject() as AdminDocument; // Conviértelo a objeto
  }



  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const existingEmail = await this.adminModel.findOne({ email });
      return !existingEmail; // Retorna true si el email no existe, false si existe
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      throw new InternalServerErrorException('Error al verificar el correo.');
    }
  }

  async checkEmailExistence(email: string): Promise<boolean> {
    try {
      const existingEmail = await this.adminModel.findOne({ email });
      return !!existingEmail; // Retorna true si el email existe, false si no existe
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      throw new InternalServerErrorException('Error al verificar el correo.');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }
  
   getJwtToken(payload: JwtPayload): string {
    // Configura la expiración del token (ejemplo: 1 hora)
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }
  
}
