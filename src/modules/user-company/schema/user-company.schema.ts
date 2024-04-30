import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserCompanyDocument = HydratedDocument<UserCompany>;

@Schema({ timestamps: true })
export class UserCompany {
    @Prop({ required: true,lowercase:true })
    name: string;

    @Prop({ required: true, trim: true, unique: true,lowercase:true  })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    phoneNumber?:string
    
    @Prop({ default: new Date(Date.now()) })
    passwordChangedAt: Date;

    @Prop({enum:['CompanyOwner','CompanyManager' , 'CopmanyAccountant'],default:'CompanyOwner'})
    role:'CompanyOwner'|'CompanyManager' | 'CopmanyAccountant'

    @Prop({ required: true })
    twoFactorySecretCode: string;

    @Prop({ required: true })
    twoFactoryQr: string;

    _id?:string

}

export const UserCompanySchema = SchemaFactory.createForClass(UserCompany);
