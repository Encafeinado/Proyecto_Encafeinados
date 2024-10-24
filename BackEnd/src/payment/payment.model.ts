import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Payment extends Document {
  @Prop({ required: true })
  shopId: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  month: number;

  @Prop({ default: false })
  statusPayment: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
