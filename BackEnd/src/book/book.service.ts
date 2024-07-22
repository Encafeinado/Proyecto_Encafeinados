import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { JwtPayload } from 'src/shop/interfaces/jwt-payload';
import { Book, BookDocument } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/auth/entities/user.entity';
import { Model } from 'mongoose';
import { Shop, ShopDocument } from 'src/shop/entities/shop.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Shop.name) private shopModel: Model<ShopDocument>,
    private jwtService: JwtService,
  ) {}

  async addImage(bookId: string, imageUrl: string): Promise<Book> {
    const book = await this.bookModel.findById(bookId);
    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    if (book.images.length >= 30) {
      throw new Error('No se pueden agregar más de 30 imágenes');
    }

    book.images.push({ url: imageUrl });
    return book.save();
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      const newBook = new this.bookModel(createBookDto);
      return newBook.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creando el libro',
      );
    }
  }

  async findAll(): Promise<Book[]> {
    return this.bookModel.find();
  }

  async findBookById(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id);
    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }
    return book;
  }

  async remove(id: string): Promise<Book> {
    const book = await this.bookModel.findByIdAndDelete(id);
    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }
    return book;
  }

  getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  async verifyAndAddCode(verifyCodeDto: VerifyCodeDto): Promise<Book> {
    const { nameShop, nameUser, code, imageUrl } = verifyCodeDto;

    // Busca al usuario por su nombre
    const user = await this.userModel.findOne({ name: nameUser });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Busca la tienda por su nombre
    const shop = await this.shopModel.findOne({ name: nameShop });
    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Crea un nuevo libro con los datos proporcionados
    const newBookDto: CreateBookDto = {
      nameShop: nameShop,
      nameUser: nameUser,
      code: code,
      images: [{ url: 'Imagen guardada' }]
    };

    try {
      const newBook = new this.bookModel(newBookDto);
      return newBook.save();
    } catch (error) {
      throw new InternalServerErrorException('Error guardando el libro');
    }
  }
}