import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type ShopDocument = Shop & Document;

@Schema({ timestamps: true })  // Habilita la creación automática de `createdAt` y `updatedAt`
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

  @Prop({ type: [{ date: Date }], default: [] })
  codeUsageDates: { date: Date }[];


  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ default: false })
  statusShop: boolean;

   // Campos adicionales generados por timestamps
   createdAt?: Date;  // Agregar si es necesario, aunque no es requerido
   updatedAt?: Date;  // Agregar para que TypeScript reconozca

  // Campo para almacenar calificaciones (estrellas) directamente en la clase
  @Prop({ type: [{ stars: Number }], default: [] })
  ratings: { stars: number }[];

  // Campo para almacenar reseñas directamente en la clase
  @Prop({ type: [{ text: String, user: String, createdAt: Date }], default: [] })
  reviews: { text: string; user: string; }[];
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
