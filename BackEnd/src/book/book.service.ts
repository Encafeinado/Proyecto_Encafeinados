import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { Book, BookDocument } from './entities/book.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/shop/interfaces/jwt-payload';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
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


  async registerInBook(data: any): Promise<any> {
    const { nameUser } = data;
    const newBookEntry = new this.bookModel({
      nameShop: '', // Ajusta según tu estructura de datos
      nameUser,
      code: '', // Ajusta según tu estructura de datos
      images: []
    });
    const result = await newBookEntry.save();
    return result.toJSON();
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
}
