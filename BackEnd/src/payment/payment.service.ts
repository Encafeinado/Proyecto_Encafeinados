import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddImageDto } from './dto/add-image.dto';
import { CreatePaymentDto } from './dto/create-Payment.dto';
import { Payment, PaymentDocument } from './entities/payment.entity';
import * as moment from 'moment';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShopService } from 'src/shop/shop.service';



@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly shopService: ShopService,
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
      throw new InternalServerErrorException('Error creando el pago');
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
  // Cron job para ejecutar el registro al inicio de cada mes
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async checkAndRegisterMonthlyPayments(): Promise<void> {
    console.log('Checking and registering monthly payments at the start of the month');
    try {
      const shops = await this.getShopList();
      for (const shop of shops) {
        console.log(`Procesando tienda: shopId=${shop._id}, name=${shop.name}`);
        await this.registerPaymentForNewMonth(shop._id, shop.name); // Cambiado a `shop.name`
      }
    } catch (error) {
      console.error('Error in checkAndRegisterMonthlyPayments:', error);
      throw new InternalServerErrorException('Error revisando y registrando pagos mensuales');
    }
  }
  
  

  async registerPaymentForNewMonth(shopId: string, name: string): Promise<void> {
    try {
      const currentYear = moment().year();
      const currentMonth = moment().month() + 1;
  
      const existingPayment = await this.paymentModel.findOne({
        shopId,
        year: currentYear,
        month: currentMonth,
      });
  
      if (!existingPayment) {
        console.log(`Registrando pago para la tienda ${shopId} con nombre ${name} en ${currentMonth}/${currentYear}`);
        
        const newPayment = new this.paymentModel({
          shopId,
          nameShop: name, // Cambiado para usar `name` como `nameShop`
          amount: 0,
          statusPayment: false,
          year: currentYear,
          month: currentMonth,
        });
  
        await newPayment.save();
      } else {
        console.log(`Pago ya existente para la tienda ${shopId} en ${currentMonth}/${currentYear}`);
      }
    } catch (error) {
      console.error('Error en registerPaymentForNewMonth:', error);
    }
  }
  

  private async getShopList(): Promise<any[]> {
    return this.shopService.findAllShops(); // Obtiene `name` y `_id`
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

