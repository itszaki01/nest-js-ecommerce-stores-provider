import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserConfirmationDocument = HydratedDocument<UserConfirmation>;

@Schema({ timestamps: true })
export class UserConfirmation {
    @Prop({ required: true,lowercase:true })
    userName: string;

    @Prop({ required: true, trim: true, unique: true,lowercase:true  })
    email: string;

    @Prop({ required: true, unique: true })
    userPhoneNumber: string;

    @Prop({ default: 0 })
    totalProfit: number;

    @Prop({ default: 0 })
    totalConfirmedOrders: number;

    @Prop({ required: true })
    password: string;

    @Prop({ default: true })
    isActive?: boolean;

    @Prop({ required: true })
    cashSecretCode: string;

    @Prop()
    ccpAccount?: string;

    @Prop()
    baridiMobAccount?: string;

    @Prop({ default: "UserConfirmation" })
    role: "UserConfirmation";

    @Prop({ required: true })
    twoFactorySecretCode: string;

    @Prop({ required: true })
    twoFactoryQr: string;

    @Prop({ default: false })
    allowMonthlyPayment?: boolean;

    @Prop({ default: false })
    mothlyPaymentAmount?: number;

    @Prop({ default: new Date(Date.now()) })
    monthlyPaymentDate?: Date;

    @Prop({ default: new Date(Date.now()) })
    passwordChangedAt: Date;

    _id?: string;
}

export const UserConfirmationSchema = SchemaFactory.createForClass(UserConfirmation);
