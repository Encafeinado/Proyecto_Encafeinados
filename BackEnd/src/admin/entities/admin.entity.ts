import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Admin {
    
    _id?: string;

    @Prop({unique: true,required: true})
    email: string;

    @Prop({required: true})
    name: string;

    @Prop({required: true,type: [Number],maxLength: 10,})
    phone: string;

    @Prop({minLength: 6, required: true})
    password?: string;

    @Prop({default: true})
    isActive: boolean;

    @Prop({ type: [String], default: ['admin']})
    roles: string[];

}

export const AdminSchema = SchemaFactory.createForClass(Admin);

export type AdminDocument = Admin & Document; 