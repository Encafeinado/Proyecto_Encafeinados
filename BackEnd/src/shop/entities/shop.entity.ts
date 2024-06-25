import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Shop {
    
    _id?: string;

    @Prop({unique: true,required: true})
    email: string;

    @Prop({required: true})
    name: string;

    @Prop({required: true})
    phone: string;

    @Prop({minLength: 6, required: true})
    password?: string;

    @Prop({default: true})
    isActive: boolean;

    @Prop({ type: [String], default: ['shop']})
    roles: string[];

    @Prop({required: true})
    specialties: string;

    @Prop({required: true})
    address: string;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);