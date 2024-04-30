import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserStopDeskDocument = HydratedDocument<UserStopDesk>;

@Schema({ timestamps: true })
export class UserStopDesk {
    @Prop({default:true})
    isActive?:boolean

    @Prop({ required: true,lowercase:true })
    stopDeskName: string;

    @Prop({ required: true, trim: true, unique: true ,lowercase:true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: new Date(Date.now()) })
    passwordChangedAt: Date;

    @Prop()
    stopDeskPhoneNumber1?:string

    @Prop()
    stopDeskPhoneNumber2?:string

    @Prop({default:0})
    totalUnPaidStoresPayments:number

    @Prop({default:0})
    totalUnPaidStoresNumber:number

    @Prop({ required: true })
    twoFactorySecretCode: string;

    @Prop({ required: true })
    twoFactoryQr: string;

    _id?:string

}

export const UserStopDeskSchema = SchemaFactory.createForClass(UserStopDesk);
