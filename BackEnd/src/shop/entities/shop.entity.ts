import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type ShopDocument = Shop & Document;

@Schema()
export class Shop {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ minLength: 6, required: true })
  password?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: ['shop'] })
  roles: string[];

  @Prop({ required: true })
  specialties1: string;

  @Prop({ required: true })
  specialties2: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  logo: Buffer;

  @Prop({ unique: true })
  verificationCode: string; // Nuevo campo para el código de verificación

  @Prop({ default: 0 })
  codeUsage: number; // Nuevo campo para contar las veces que se ha usado el código

  @Prop({ required: true })
  latitude: number; // Nuevo campo para la latitud

  @Prop({ required: true })
  longitude: number; // Nuevo campo para la longitud

  @Prop({default: false})
  statusShop: boolean; // Nuevo campo para prender la tienda
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
