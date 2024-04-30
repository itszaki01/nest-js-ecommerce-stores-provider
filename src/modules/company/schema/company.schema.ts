import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
    @Prop({ required: true })
    allowSubScreaptions: boolean;

    @Prop({ required: true })
    allowSignUp: boolean;

    @Prop({ required: true })
    allowStopDeskShipping: boolean;

    @Prop()
    explainVediosLink?: string;

    @Prop({ required: true })
    compnayBaseUrl: string;

    @Prop({ default: true })
    isShippingCompany: boolean;

    @Prop({ required: true })
    companyFbPage: string;

    @Prop({ required: true })
    allowCopyRigths: boolean;

    @Prop()
    reportProblemContact?: string;

    @Prop({ required: true })
    logo: string;

    @Prop({ required: true })
    companyNameAr: string;

    @Prop({ required: true })
    companyNameFr: string;

    @Prop({ required: true })
    companyEcoSystem: string;

    @Prop({ required: true })
    companyCdnUrl: string;

    @Prop({ required: true })
    ns1: string;

    @Prop({ required: true })
    ns2: string;

    @Prop({ required: true })
    themeColor: string;

    @Prop({ required: true })
    textColor: string;

    // @Prop({ required: true })
    // allowBulkShipping: boolean;

    @Prop({ required: true })
    memberConfirmationFee: number;

    @Prop({ required: true })
    afflitaConfirmationFee: number;

    @Prop({ required: true })
    companyConfirmationFee: number;

    @Prop({ required: true })
    companyAdvencedShippedOrderConfirmationMemberFee: number;

    @Prop({ required: true })
    allowOrdersAutoTracking: boolean;

    @Prop({ enum: ["OrderConfirmed", "OrderShipped", "AdvencedOrderCalcs"] })
    confirmationServiceCalcsType: "OrderConfirmed" | "OrderShipped" | "AdvencedOrderCalcs";

    @Prop({ enum: ["OrderConfirmed", "OrderShipped"] })
    storeServiceCaclsType: "OrderConfirmed" | "OrderShipped";

    @Prop({ required: true })
    storeServicePrecentageFee: number;

    @Prop({ required: true })
    storeServicePrecentageProFee: number;

    @Prop({ required: true })
    confirmationServicePrecentageFee: number;

    @Prop({ default: 0 })
    currentConfirmationMemberIdx: number;

    @Prop({ required: true })
    confirmedOrderMinFeePrice: number;

    @Prop({ required: true })
    shippedOrderMinFeePrice: number;

    @Prop({ required: true })
    advencedOrderCalcsConfirmationMinPrice: number;

    @Prop({ required: true })
    allowCompanyShoppingCart: boolean;

    @Prop({ required: true })
    allowMonthlySubscription: boolean;

    @Prop({default: new Date(Date.now())})
    dailyCheckerDate: Date;

    @Prop({
        type: {
            basicSubscriptionFeeAfflita: Number,
            basicSubscriptionFee: Number,
            proSubscriptionFeeAfflita: Number,
            proSubscriptionFee: Number,
        },
    })
    monthlySubScreptionFees: {
        basicSubscriptionFeeAfflita: number;
        basicSubscriptionFee: number;
        proSubscriptionFeeAfflita: number;
        proSubscriptionFee: number;
    };

    @Prop({ required: true })
    companyMaxCartItems: number;

    //TODO: ADD VEDIOS EXPLAIN SCHEMA
}

export const CompanySchema = SchemaFactory.createForClass(Company);
