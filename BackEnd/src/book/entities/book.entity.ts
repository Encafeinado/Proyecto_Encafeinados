import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Book {
  @Prop({ required: true })
  nameUser: string; // Nombre del usuario que creó el libro

  @Prop({ required: true })
  userId: string; // ID del usuario
  
  @Prop({ default: true })
  status: boolean; // Estado del libro

  @Prop({
    type: [{ 
      code: String, 
      name: String, 
      image: Buffer // O string si usas base64
    }],
    default: [],
    validate: [(val) => val.length <= 30, 'Se permite un máximo de 30 imágenes'],
  })
  images: { 
    code: string;
    name: string;
    image: Buffer; // O string si usas base64
  }[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
export type BookDocument = Book & Document;
