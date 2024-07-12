import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

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
    type: [{ url: String }],
    default: [],
    validate: [(val) => val.length <= 30, 'Se permite un máximo de 30 imágenes'],
  })
  images: { url: string }[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
export type BookDocument = Book & Document;
