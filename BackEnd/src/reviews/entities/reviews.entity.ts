import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema()
export class Review {
  @Prop({ required: true, type: String })
  review: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
