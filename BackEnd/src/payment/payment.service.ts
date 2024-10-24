import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddImageDto } from './dto/add-image.dto';
import { CreatePaymentDto } from './dto/create-Payment.dto';
import { Payment, PaymentDocument } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async addImage(paymentId: string, addImageDto: AddImageDto): Promise<Payment> {
    const payment = await this.paymentModel.findById(paymentId);
  
    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }
  
    // Validar límite de imágenes
    if (payment.images.length >= 30) {
      throw new Error('No se pueden agregar más de 30 imágenes');
    }
  
    // Convertir la imagen de base64 a Buffer (si es necesario)
    const bufferImage = Buffer.from(addImageDto.image, 'base64');
  
    // Agregar la imagen directamente al array
    //payment.images.push(bufferImage);
  
    // Guardar y devolver el pago actualizado
    return payment.save();
  }
  
  

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const newPayment = new this.paymentModel(createPaymentDto);
      return newPayment.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creando el libro');
    }
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find();
  }


  async findPaymentStatusByShopId(shopId: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ shopId }).exec();
    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }
    return payment;
  }
  



  async findPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id);
    if (!payment) {
      throw new NotFoundException('Libro no encontrado');
    }
    return payment;
  }

  async findPaymentByUserId(userId: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ userId }).exec();
    if (!payment) {
      throw new NotFoundException(' not found');
    }
    return payment;
  }

}

