import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { RegisterUserDto, CreateUserDto, UpdateAuthDto, LoginDto } from './dto';
import { User } from './entities/user.entity';
import { Book } from '../book/entities/book.entity'; // Importa el Book entity
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponce } from './interfaces/login-responce';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Book.name) private bookModel: Model<Book>, // Inyecta el modelo de Book
    private jwtService: JwtService,
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
    await this.createBookForUser(user); // Crea el registro en la colección Book
    console.log({ user });
    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    };
  }

  async createBookForUser(user: User): Promise<void> {
    try {
      const newBook = new this.bookModel({
        nameShop: '', // Deja los campos vacíos
        nameUser: user.name,
        code: '',
        status: true,
        images: [],
      });
      await newBook.save();
    } catch (error) {
      // Captura y maneja errores específicos de Mongoose
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
      throw new UnauthorizedException('Credenciales del correo no validas');
    }
    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales de la contraseña no validas');
    }
    const { password: _, ...rest } = user.toJSON();
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  async findShopById(id: string) {
    const shop = await this.userModel.findById(id);
    const { password, ...rest } = shop.toJSON();
    return rest;
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
