import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { RegisterShopDto, LoginDto } from './dto';
import { Shop, ShopDocument } from './entities/shop.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponce } from './interfaces/login-responce';
import { User, UserDocument } from '../auth/entities/user.entity';
import { Book, BookDocument } from 'src/book/entities/book.entity';

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(Shop.name)
    private shopModel: Model<ShopDocument>, // Usa ShopDocument aquí
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Book.name) // Asegúrate de inyectar el modelo Book
    private bookModel: Model<BookDocument>,
    private jwtService: JwtService,
  ) {}
  async verifyVerificationCodeByCodeAndAddCoins(
    code: string,
    userId: string,
    review?: string,
    rating?: number
  ): Promise<{ message: string; shop?: ShopDocument }> {
    // Buscar la tienda con el código de verificación
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
  
    // Actualizar el uso del código y generar un nuevo código de verificación
    shop.codeUsage = (shop.codeUsage || 0) + 1;
    shop.verificationCode = await this.generateUniqueVerificationCode();
  
    // Si se proporciona una calificación, añádela a la tienda
    if (rating) {
      shop.ratings.push({ stars: rating });
    }
  
    // Si se proporciona una reseña, añádela a la tienda
    if (review) {
      shop.reviews.push({
        text: review,
        user: userId, // Guardar el ID del usuario para referencia
      });
    }
  
    await shop.save();
  
    // Actualizar el libro del usuario con los detalles de la tienda
    await this.updateBookWithShopDetails(shop, userId);
  
    return {
      message: 'Código de verificación guardado exitosamente',
      shop: shop.toObject() as ShopDocument,
    };
  }

  async updateBookWithShopDetails(
    shop: ShopDocument,
    userId: string,
  ): Promise<void> {
    // Buscar el libro asociado al usuario
    const book = await this.bookModel.findOne({ userId: userId });

    if (!book) {
      throw new NotFoundException('Libro no encontrado para el usuario');
    }

    // Verificar si la tienda ya está presente en el libro basándose en el nombre
    const shopExists = book.images.some((image) => image.name === shop.name);
    if (shopExists) {
      throw new ConflictException('La tienda ya está presente en el libro');
    }

    // Agregar los detalles de la tienda al libro
    book.images.push({
      code: shop.verificationCode,
      name: shop.name,
      image: shop.logo, // Asegúrate de que esto sea un Buffer o base64
    });

    await book.save();
    console.log('Libro actualizado con los detalles de la tienda:', book);
  }

  async create(
    createShopDto: RegisterShopDto,
    logoBase64: string,
  ): Promise<ShopDocument> {
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
        codeUsage: 0,
      });

      await newShop.save();
      console.log('New shop saved:', newShop);

      const { password: _, ...shop } = newShop.toJSON();
      return shop as ShopDocument;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createShopDto.email} Ya Existe!`);
      }
      throw new InternalServerErrorException(
        'Algo terrible está sucediendo!!!!',
      );
    }
  }

  async getUsedCodesByMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.shopModel.aggregate([
      {
        $match: {
          updatedAt: { $gte: startDate, $lte: endDate },
          codeUsage: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalCodesUsed: { $sum: '$codeUsage' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalCodesUsed : 0;
  }

  //verificar  librerias para generar código aleatorio
  async generateUniqueVerificationCode(): Promise<string> {
    let code: string;
    let codeExists: boolean;
  
    do {
      // Genera un número entre 0 y 9999, y lo rellena con ceros a la izquierda si es necesario
      code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      codeExists = (await this.shopModel.exists({ verificationCode: code })) !== null;
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
      // shop.codeUsage = (shop.codeUsage || 0) + 1;
      shop.verificationCode = await this.generateUniqueVerificationCode();
      await shop.save();
      console.log('Updated shop with new code and usage:', shop);
      return true;
    }

    return false;
  }

  async verifyVerificationCodeByCode(
    code: string,
  ): Promise<ShopDocument | null> {
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
      throw new UnauthorizedException('Error credenciales incorrectas');
    }

    if (!bcryptjs.compareSync(password, shop.password)) {
      throw new UnauthorizedException(
        'Credenciales de la contraseña no válidas',
      );
    }

    const { password: _, ...rest } = shop.toJSON();
    return {
      shop: rest,
      token: this.getJwtToken({ id: shop._id.toString() }),
    };
  }

  async checkEmailExistence(email: string): Promise<boolean> {
    try {
      const existingEmail = await this.shopModel.findOne({ email });
      return !!existingEmail; // Retorna true si el email existe, false si no existe
    } catch (error) {
      console.error('Error al verificar el correo:', error);
      throw new InternalServerErrorException('Error al verificar el correo.');
    }
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const shop = await this.shopModel.findOne({ email }); // Cambiado de findByEmail a findOne
  
    if (!shop) {
      return false;
    }
  
    // Compara la contraseña proporcionada con la almacenada en la base de datos
    return bcryptjs.compare(password, shop.password);
  }
  

  async register(
    registerDto: RegisterShopDto,
    logoBase64: string,
  ): Promise<LoginResponce> {
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

  findAllShops(): Promise<ShopDocument[]> {
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

  async updateShopStatus(id: string, statusShop: boolean): Promise<Shop> {
    return this.shopModel.findByIdAndUpdate(id, { statusShop }, { new: true });
  }
}
