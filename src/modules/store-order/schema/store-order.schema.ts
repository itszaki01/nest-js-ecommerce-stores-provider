import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { StoreLocation } from "src/modules/store-location/schema/store-location.schema";
import { StoreProduct } from "src/modules/store-product/schema/store-product.schema";
import { Store } from "src/modules/store/schema/store.schema";

export type StoreOrderDocument = HydratedDocument<StoreOrder>;

@Schema({ timestamps: true })
export class StoreOrder {
    @Prop({ type: String, required: true, trim: true })
    productName: string;

    @Prop()
    offerId: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name, required: true })
    store: string;

    @Prop({ type: String, required: true, trim: true })
    productSku: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: StoreLocation.name })
    locationId: string;

    @Prop({ type: Number, required: true })
    quantity: number;

    @Prop({ type: Number, required: true })
    productPrice: number;

    @Prop()
    totalPrice: number;

    @Prop()
    shippingPrice: number;

    @Prop({ type: Number, required: true })
    fakeShippingPrice: number;

    @Prop({ trim: true })
    clientLocation: string;

    @Prop({ trim: true })
    clientAddress: string;

    @Prop({ type: String, required: true })
    clientPhoneNumber: string;

    @Prop({ type: String })
    properties: string;

    @Prop({ trim: true })
    clientName: string;

    @Prop()
    totalProductFees: number;

    @Prop({ type: String, enum: ["للمنزل", "للمكتب", "مجاني"], required: true })
    shippingType: "للمنزل" | "للمكتب" | "مجاني";

    @Prop()
    productFees: number;

    @Prop({ type: String, required: true })
    productShortName: string;

    @Prop()
    porductCategory: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: StoreProduct.name })
    productId: string;

    @Prop({ type: String, required: true })
    orderUID?: string;

    @Prop()
    note?: string;

    @Prop({
        type: String,
        enum: ["جديد", "متروك", "محاولة 1", "محاولة 2", "محاولة 3", "مأكد", "ملغي", "قيد التوصيل", "مستلم", "مسترجع"],
        required: true,
    })
    orderStatus: "جديد" | "متروك" | "محاولة 1" | "محاولة 2" | "محاولة 3" | "مأكد" | "ملغي" | "قيد التوصيل" | "مستلم" | "مسترجع";

    @Prop({ default: false })
    isInDelivery: boolean;

    @Prop({ default: false })
    isShipped: boolean;

    @Prop({
        type: Date,
        default: new Date(Date.now() + 3600 * 1000 * 720),
        index: { expireAfterSeconds: 2592000 },
    })
    expireAt?: Date;

    @Prop()
    orderCommesion: number;

    @Prop({ default: false })
    isFeesPaid: boolean;

    @Prop()
    orderTracking: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    assignToStoreCallMember: string;

    @Prop({ enum: ["StoreService", "CompanyService"] })
    confirmedAndShippedBy: "StoreService" | "CompanyService";

    @Prop({ default: false })
    isStoreFeesPaid: boolean;

    @Prop()
    imageCover: string;

    @Prop()
    storeName: string;

    @Prop({ default: false })
    isFinishedStoreCalcsCycle: boolean;

    @Prop({ default: false })
    isFinishedConfirmationServiceCalcsCycle: boolean;

    @Prop({ default: false })
    isFromCart: boolean;

    @Prop()
    cartUID: string;

    @Prop({ default: true })
    isCartMainOrder: boolean;

    @Prop({ default: 0 })
    cartTotalPrice: number;

    @Prop()
    isFromSubStore: boolean;

    @Prop()
    productSlug:string

    @Prop()
    subStore: string;

    @Prop({ type: Date })
    ordredAt: Date;

    _id?: string;
}

export const StoreOrderSchema = SchemaFactory.createForClass(StoreOrder);
