import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { RegisterUserDto, CreateUserDto, UpdateAuthDto, LoginDto } from './dto';
import { User, UserDocument } from './entities/user.entity';
import { Book } from '../book/entities/book.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponce } from './interfaces/login-responce';
import { MailService } from './mail/mail.service';
import { Shop } from 'src/shop/entities/shop.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Shop.name) private shopModel: Model<Shop>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });
      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} Ya Existe!`);
      }
      throw new InternalServerErrorException('Algo terrible esta sucediendo!!!!');
    }
  }

  async register(registerDto: RegisterUserDto): Promise<LoginResponce> {
    const user = await this.create(registerDto);
    await this.createBookForUser(user);
    console.log({ user });
    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    };
  }

  async createBookForUser(user: User): Promise<void> {
    try {
      const newBook = new this.bookModel({
        nameShop: '', 
        nameUser: user.name,
        code: '',
        status: true,
        images: [],
      });
      await newBook.save();
    } catch (error) {

      if (error.name === 'ValidationError') {
        throw new BadRequestException('Error de validación al crear el libro');
      }
      throw new InternalServerErrorException('Error creando el libro');
    }
  }
  
  async login(loginDto: LoginDto): Promise<LoginResponce> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      console.log('Email not found');
      throw new UnauthorizedException('Error credenciales incorrectas ');
    }
    if (!bcryptjs.compareSync(password, user.password)) {
      console.log('Password incorrect');
      throw new UnauthorizedException('Credenciales de la contraseña no válidas');
    }
    const { password: _, ...rest } = user.toJSON();
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }



  
  async sendPasswordResetToken(email: string): Promise<void> {

    const user = await this.userModel.findOne({ email });


    const shop = !user ? await this.shopModel.findOne({ email }) : null;

    if (!user && !shop) {
      throw new NotFoundException('Correo electrónico no registrado en ninguna de las colecciones');
    }

    const entity = user || shop;
    const token = this.jwtService.sign({ id: entity._id }, { expiresIn: '1h' });

    console.log('Generated token:', token);

    await this.mailService.sendPasswordResetMail(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
     
      const payload = this.jwtService.verify(token);
      
  
      const user = await this.userModel.findById(payload.id);
      const shop = !user ? await this.shopModel.findById(payload.id) : null;

      if (!user && !shop) {
        throw new NotFoundException('Usuario o tienda no encontrado');
      }

  
      if (user) {
        user.password = bcryptjs.hashSync(newPassword, 10);
        await user.save();
      }



    } catch (error) {
     
      throw new UnauthorizedException('Token no válido o expirado');
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user.toObject() as UserDocument; // Conviértelo a objeto
  }


  async findShopById(id: string) {
    const shop = await this.userModel.findById(id);
    const { password, ...rest } = shop.toJSON();
    return rest;
  }


  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const existingEmail = await this.userModel.findOne({ email });
      return !existingEmail; // Retorna true si el email no existe, false si existe
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      throw new InternalServerErrorException('Error al verificar el correo.');
    }
  }

  async checkEmailExistence(email: string): Promise<boolean> {
    try {
      const existingEmail = await this.userModel.findOne({ email });
      return !!existingEmail; // Retorna true si el email existe, false si no existe
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      throw new InternalServerErrorException('Error al verificar el correo.');
    }
  }
  
  
  


  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
