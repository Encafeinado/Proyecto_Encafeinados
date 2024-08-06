import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from './entities/book.entity';
import { AddImageDto } from './dto/add-image.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  async addImage(bookId: string, addImageDto: AddImageDto): Promise<Book> {
    const book = await this.bookModel.findById(bookId);
    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    if (book.images.length >= 30) {
      throw new Error('No se pueden agregar más de 30 imágenes');
    }

    // Agrega la nueva imagen al array
    book.images.push({
      code: addImageDto.code,
      name: addImageDto.name,
      image: addImageDto.image
    });

    return book.save();
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      const newBook = new this.bookModel(createBookDto);
      return newBook.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creando el libro');
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

  async findBookByUserId(userId: string): Promise<Book> {
    const book = await this.bookModel.findOne({ userId }).exec();
    if (!book) {
      throw new NotFoundException('Book not found');
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
}

