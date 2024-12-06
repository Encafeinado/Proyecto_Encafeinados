import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
    
    _id?: string;

    @Prop({unique: true,required: true})
    email: string;

    @Prop({required: true})
    name: string;

    @Prop({required: true,type: [Number],maxLength: 10,})
    phone: string;

    @Prop({required: true})
    password?: string;

    @Prop({default: true})
    isActive: boolean;

    @Prop({ type: [String], default: ['user']})
    roles: string[];

    @Prop({default: 0})
    cafecoin: number;

    @Prop({required: true, enum: ['Local', 'Extranjero'], default: 'Local'})
    origin: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document; 