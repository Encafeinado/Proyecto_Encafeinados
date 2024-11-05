import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Payment {
  @Prop({ required: true })
  nameShop: string; // Nombre de la tienda

  @Prop({ required: true })
  shopId: string; // ID de la tienda

  @Prop({ required: true })
  statusPayment: boolean; // Estado del pago (completado o no)

  @Prop({ required: true })
  year: number; // Año del pago

  @Prop({ required: true })
  month: number; // Mes del pago (1-12)

  @Prop({
     // Tipo Buffer para almacenar imágenes directamente
  })
  images: string[]; // Arreglo de imágenes
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
export type PaymentDocument = Payment & Document;
