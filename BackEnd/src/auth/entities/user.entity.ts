import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
    
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

    @Prop({ type: [String], default: ['user']})
    roles: string[];

    @Prop({default: 0})
    cafecoin: number;
}

export const UserSchema = SchemaFactory.createForClass(User);