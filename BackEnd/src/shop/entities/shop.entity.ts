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
  verificationCode: string;

  @Prop({ default: 0 })
  codeUsage: number;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ default: false })
  statusShop: boolean;

  // Campo para almacenar calificaciones (estrellas) directamente en la clase
  @Prop({ type: [{ stars: Number }], default: [] })
  ratings: { stars: number }[];

  // Campo para almacenar reseñas directamente en la clase
  @Prop({ type: [{ text: String, user: String, createdAt: Date }], default: [] })
  reviews: { text: string; user: string;}[];
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
