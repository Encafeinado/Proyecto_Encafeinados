import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { RegisterShopDto, LoginDto } from './dto';
import { Shop, ShopDocument } from './entities/shop.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponce } from './interfaces/login-responce';
import { User, UserDocument } from '../auth/entities/user.entity';

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(Shop.name)
    private shopModel: Model<ShopDocument>, // Usa ShopDocument aquí
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}
  async verifyVerificationCodeByCodeAndAddCoins(code: string, userId: string): Promise<{ message: string, shop?: ShopDocument }> {
    const shop = await this.shopModel.findOne({ verificationCode: code });
  
    if (!shop) {
      return { message: 'Código de verificación no válido' };
    }
  
    // Actualizar los CoffeeCoins del usuario
    const user = await this.userModel.findById(userId);
    if (user) {
      user.cafecoin += 10; // Aumentar los CoffeeCoins
      await user.save();
    }
  
    shop.codeUsage = (shop.codeUsage || 0) + 1;
    shop.verificationCode = await this.generateUniqueVerificationCode();
    await shop.save();
    console.log('Updated shop with new code and usage:', shop);
    return { message: 'Código de verificación guardado exitosamente', shop: shop.toObject() as ShopDocument };
  }
  

  async create(createShopDto: RegisterShopDto, logoBase64: string): Promise<ShopDocument> {
    try {
      const { password, ...shopData } = createShopDto;

      const base64Data = logoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const logoBuffer = Buffer.from(base64Data, 'base64');

      const verificationCode = await this.generateUniqueVerificationCode();
      console.log('Generated verification code:', verificationCode);

      const newShop = new this.shopModel({
        password: bcryptjs.hashSync(password, 10),
        ...shopData,
        logo: logoBuffer,
        verificationCode,
        codeUsage: 0
      });

      await newShop.save();
      console.log('New shop saved:', newShop);

      const { password: _, ...shop } = newShop.toJSON();
      return shop as ShopDocument;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createShopDto.email} Ya Existe!`);
      }
      throw new InternalServerErrorException('Algo terrible está sucediendo!!!!');
    }
  }
//verificar  librerias para generar código aleatorio
  async generateUniqueVerificationCode(): Promise<string> {
    let code: string;
    let codeExists: boolean;

    do {
      code = Math.random().toString(36).substring(2, 8);
      codeExists = await this.shopModel.exists({ verificationCode: code }) !== null;
      console.log('Checking if code exists:', code, codeExists);
    } while (codeExists);

    return code;
  }

  async verifyVerificationCode(shopId: string, code: string): Promise<boolean> {
    const shop = await this.shopModel.findById(shopId);

    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (shop.verificationCode === code) {
      shop.codeUsage = (shop.codeUsage || 0) + 1;
      shop.verificationCode = await this.generateUniqueVerificationCode();
      await shop.save();
      console.log('Updated shop with new code and usage:', shop);
      return true;
    }

    return false;
  }

  async verifyVerificationCodeByCode(code: string): Promise<ShopDocument | null> {
    const shop = await this.shopModel.findOne({ verificationCode: code });

    if (!shop) {
      return null;
    }

    shop.codeUsage = (shop.codeUsage || 0) + 1;
    shop.verificationCode = await this.generateUniqueVerificationCode();
    await shop.save();
    console.log('Updated shop with new code and usage:', shop);
    return shop;
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
      token: this.getJwtToken({ id: shop._id.toString() }), // Asegúrate de que el ID es una cadena
    };
  }

  async register(registerDto: RegisterShopDto, logoBase64: string): Promise<LoginResponce> {
    try {
      const shop = await this.create(registerDto, logoBase64);

      return {
        shop: shop,
        token: this.getJwtToken({ id: shop._id.toString() }), // Asegúrate de que el ID es una cadena
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al registrar tienda');
    }
  }

  findAll(): Promise<ShopDocument[]> {
    return this.shopModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

// <<<<<<< HEAD
  async findShopById(id: string): Promise<ShopDocument> {
    const shop = await this.shopModel.findById(id);
    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }
    return shop.toObject() as ShopDocument; // Conviértelo a objeto
// =======
//   async findShopById(id: string): Promise<any> {
//     const shop = await this.shopModel.findById(id).exec();
//     if (!shop) {
//       throw new NotFoundException('Tienda no encontrada');
//     }

//     // Convierte el logo a base64 si está presente
//     let logoBase64 = null;
//     if (shop.logo) {
//       logoBase64 = `data:image/png;base64,${shop.logo.toString('base64')}`;
//     }

//     return {
//       ...shop.toJSON(),
//       logo: logoBase64
//     };
// >>>>>>> 97129f26196d5ca8ba9dfb94447dc286ff2e3439
  }

  getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
