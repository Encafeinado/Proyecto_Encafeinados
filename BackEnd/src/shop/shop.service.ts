import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { RegisterShopDto, LoginDto } from './dto';
import { Shop } from './entities/shop.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponce } from './interfaces/login-responce';

@Injectable()
export class ShopService {

  constructor(
    @InjectModel(Shop.name)
    private shopModel: Model<Shop>,
    private jwtService: JwtService
  ) {}

  async create(createShopDto: RegisterShopDto, logoBase64: string): Promise<Shop> {
    try {
        const { password, ...shopData } = createShopDto;

        const logoBuffer = Buffer.from(logoBase64, 'base64'); // Convierte de base64 a buffer

        const newShop = new this.shopModel({
            password: bcryptjs.hashSync(password, 10),
            ...shopData,
            logo: logoBuffer, // Guarda el logo como un buffer en MongoDB
        });

        await newShop.save();

        const { password: _, ...shop } = newShop.toJSON();
        return shop as Shop;
    } catch (error) {
        if (error.code === 11000) {
            throw new BadRequestException(`${createShopDto.email} Ya Existe!`);
        }
        throw new InternalServerErrorException('Algo terrible está sucediendo!!!!');
    }
}

  async login(loginDto: LoginDto): Promise<LoginResponce> {
    const { email, password } = loginDto;
    const shop = await this.shopModel.findOne({ email });

    if (!shop) {
      throw new UnauthorizedException('Credenciales del correo no válidas');
    }

    if (!bcryptjs.compareSync(password, shop.password)) {
      throw new UnauthorizedException('Credenciales de la contraseña no válidas');
    }

    const { password: _, ...rest } = shop.toJSON();
    return {
      shop: rest,
      token: this.getJwtToken({ id: shop.id }),
    };
  }

  async register(registerDto: RegisterShopDto): Promise<LoginResponce> {
    // Aquí podrías manejar la carga del logo y convertirlo a base64 si lo deseas
    const logoBase64 = ''; // Aquí iría la lógica para convertir el logo a base64
    const shop = await this.create(registerDto, logoBase64);

    return {
      shop: shop,
      token: this.getJwtToken({ id: shop._id })
    };
  }

  findAll(): Promise<Shop[]> {
    return this.shopModel.find();
  }

  async findShopById(id: string): Promise<any> {
    const shop = await this.shopModel.findById(id);
    const { password, ...rest } = shop.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
