import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Image, ImageSchema } from './image.entity'; // Importamos el esquema de Image

@Schema()
export class Book {
  @Prop()
  nameShop: string;

  @Prop({ required: true })
  nameUser: string;

  @Prop()
  code: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({
    type: [ImageSchema],
    default: [],
    validate: [(val: Image[]) => val.length <= 30, 'Se permite un máximo de 30 imágenes'],
  })
  images: Image[];
}

export const BookSchema = SchemaFactory.createForClass(Book);

export type BookDocument = Book & Document;
