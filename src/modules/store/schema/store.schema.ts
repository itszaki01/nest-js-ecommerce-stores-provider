import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { UserStopDesk } from "src/modules/user-stop-desk/schema/user-stop-desk.schema";
import { UserStore } from "src/modules/user-store/schema/user-store.schema";

export type StoreDocument = HydratedDocument<Store>;

@Schema({ timestamps: true })
export class Store {
    @Prop({ default: true })
    isActive?: boolean;

    @Prop({ trim: true })
    themeColor: string;

    @Prop({ trim: true })
    themeColorOriginal: string;

    @Prop()
    navTitle: string;

    @Prop({ default: false })
    isMonthlySubscreptionPaid: boolean;

    @Prop()
    headerTitle: string;

    @Prop()
    storeTitle: string;

    @Prop()
    sotreDescription: string;

    @Prop()
    subScriptionExpireAfterDays: number;

    @Prop({ unique: true, required: true, lowercase: true })
    storeSubDomain?: string;

    @Prop({ default: false })
    isSubStore: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    mainStore: string;

    @Prop()
    infinitCarouselLoop: boolean;

    @Prop()
    itemsInPage: number;

    @Prop()
    favicon: string;

    @Prop()
    showSuggestdProducts: boolean;

    @Prop()
    allowLocations: boolean;

    @Prop()
    currency: string;

    @Prop()
    locationPrefix: string;

    @Prop()
    unCompleteOrderSttngs: number;

    @Prop({ trim: true })
    googleSheetApi: string;

    @Prop()
    shippingPrefix: string;

    @Prop()
    allowFacebookPixel: boolean;

    @Prop({ type: [{ pixelId: { type: String, trim: true } }], trim: true })
    facebookPixelIds: { pixelId: string }[];

    @Prop()
    thankYouPageBody: string;

    @Prop()
    currencyCode: string;

    @Prop()
    allowTiktokPixel: boolean;

    @Prop({ type: [{ pixelId: { type: String, trim: true } }] })
    tikTokPixelIds: { pixelId: string }[];

    @Prop()
    countryPhoneCode: string;

    @Prop()
    country: string;

    @Prop()
    ordersLimitPerHour: number;

    @Prop({ trim: true })
    googleTagManagerId: string;

    @Prop()
    allowGoogleTagManager: boolean;

    @Prop()
    allowGoogleAnalytics: boolean;

    @Prop({ trim: true })
    googleAnalyticsId: string;

    @Prop()
    addressPlaceHolder: string;

    @Prop()
    policyText: string;

    @Prop()
    allowWhatsapp: boolean;

    @Prop({ trim: true })
    whatsappNumber: string;

    @Prop()
    allowInstagram: boolean;

    @Prop({ trim: true })
    instagramLink: string;

    @Prop()
    allowFacebook: boolean;

    @Prop({ trim: true })
    facebookLink: string;

    @Prop()
    allowPhoneNumber: boolean;

    @Prop({ trim: true })
    phoneNumber: string;

    @Prop()
    storeRights: string;

    @Prop()
    allowFacebookConvApi: boolean;

    @Prop({
        type: {
            pixelId: { type: String },
            access_token: { type: String },
            allowTestMode: Boolean,
            testCode: { type: String },
        },
    })
    facebookConvApi: { pixelId: string; access_token: string; allowTestMode: boolean; testCode: string };

    @Prop()
    allowTikTokConvApi: boolean;

    @Prop({
        type: {
            pixelId: { type: String, trim: true },
            access_token: { type: String, trim: true },
            allowTestMode: Boolean,
            testCode: { type: String, trim: true },
        },
    })
    tikTokConvApi: { pixelId: string; access_token: string; allowTestMode: boolean; testCode: string };

    @Prop({
        type: mongoose.Types.ObjectId,
        default: function () {
            return this._id;
        },
    })
    id?: string;

    @Prop()
    headCode: string;

    @Prop({
        type: {
            square: Boolean,
            logoLink: String,
        },
    })
    secondryLogo: {
        square: boolean;
        logoLink: string;
    };

    @Prop()
    allowCities: boolean;

    @Prop({ default: false })
    allowShoppingCart: boolean;

    @Prop({ default: false })
    allowConfirmationService: boolean;

    @Prop({ enum: ["OrderConfirmed", "OrderShipped"], default: "OrderConfirmed" })
    confirmationServiceCalcsType: "OrderConfirmed" | "OrderShipped";

    @Prop({ default: 0 })
    totalConfirmationServiceFees: number;

    @Prop({ default: 0 })
    totalConfirmationServiceConfirmedOrders: number;

    @Prop()
    lastShippedOrderDate: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserStopDesk.name, required: true })
    createdByStopDesk?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserStore.name })
    storeOwner?: string;

    @Prop({ required: true, enum: ["basic", "pro"] })
    storeSubcreption?: "basic" | "pro";

    @Prop({ default: 0 })
    totalUnpaidFees: number;

    @Prop({ default: 0 })
    totalUnpaidOrders: number;

    @Prop({ default: 0 })
    shippedOrderConfirmationMemberFee?: number;

    @Prop({ default: 0 })
    currentConfirmationMemberIdx: number;

    @Prop({ trim: true })
    apiKey1?: string;

    @Prop({ trim: true })
    apiKey2?: string;

    @Prop({ trim: true })
    apiKey3?: string;

    @Prop({ trim: true })
    apiKey4?: string;

    @Prop({ trim: true })
    apiKey5?: string;

    _id?: string;
}

export const StoreSchema = SchemaFactory.createForClass(Store);
