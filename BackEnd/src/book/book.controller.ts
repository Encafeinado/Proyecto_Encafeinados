import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { AddImageDto } from './dto/add-image.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Post(':id/images')
  async addImage(
    @Param('id') bookId: string,
    @Body() addImageDto: AddImageDto,
  ) {
    return this.bookService.addImage(bookId, addImageDto.url);
  }

  @Post('/verify-code')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    const result = await this.bookService.verifyAndAddCode(verifyCodeDto);
    return { message: 'Código verificado guardado exitosamente', result };
  }
  @Get()
  async findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookService.findBookById(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}