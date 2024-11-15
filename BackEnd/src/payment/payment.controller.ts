import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { AddImageDto } from './dto/add-image.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create') // Ruta para crear un nuevo pago
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }
  
  @Patch(':id') // Ruta para actualizar un pago existente
  async update(@Param('id') id: string, @Body() updatePaymentDto: CreatePaymentDto) {
    const updatedPayment = await this.paymentService.update(id, updatePaymentDto);
    if (!updatedPayment) {
      throw new NotFoundException('Pago no encontrado para actualizar');
    }
    return updatedPayment;
  }

  @Post(':id/images')
  async addImage(
    @Param('id') paymentId: string,
    @Body() addImageDto: AddImageDto,
  ) {
    return this.paymentService.addImage(paymentId, addImageDto);
  }

  @Get('status/:shopId')
  async getPaymentStatusByShopId(@Param('shopId') shopId: string) {
    const payment = await this.paymentService.findPaymentStatusByShopId(shopId);
    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }
    return { statusPayment: payment.statusPayment };
  }
  
  @Get('test-register-monthly') // Endpoint temporal para prueba
  async testRegisterMonthlyPayments() {
    await this.paymentService.checkAndRegisterMonthlyPayments();
    return { message: 'Monthly payments checked and registered if needed' };
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
