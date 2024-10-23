
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post
} from '@nestjs/common';
import { AddImageDto } from './dto/add-image.dto';
import { CreatePaymentDto } from './dto/create-Payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create') // Aquí añadimos 'create' para definir la ruta explícita
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Post(':id/images')
  async addImage(
    @Param('id') paymentId: string,
    @Body() addImageDto: AddImageDto,
  ) {
    return this.paymentService.addImage(paymentId, addImageDto);
  }

  @Get()
  async findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentService.findPaymentById(id);
  }

  @Get('payment/:paymentId')
  async findByPaymentId(@Param('paymentId') paymentId: string) {
    return this.paymentService.findPaymentById(paymentId);
  }
}
