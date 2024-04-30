import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";

export type StoreProductDocument = HydratedDocument<StoreProduct>;

@Schema({ timestamps: true })
export class StoreProduct {
    @Prop()
    allowSpecialGoogleSheet?: boolean;

    @Prop()
    allowSendOrderToAllSheets?: boolean;

    @Prop({ trim: true })
    specialGoogleSheetsApiKey?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;

    @Prop()
    showProduct: boolean;

    @Prop()
    disableAddToShoppingCart?:boolean

    @Prop()
    disableSuggestedProducts?:boolean

    @Prop({ type: String, required: true, trim: true })
    productSku: string;

    @Prop()
    name: string;

    @Prop({ trim: true })
    productShortName: string;

    @Prop()
    productFees: number;

    @Prop()
    price: number;

    @Prop()
    description: string;

    @Prop()
    freeShipping: boolean;

    @Prop()
    remainingQtty?:number

    @Prop()
    singleShipping: boolean;

    @Prop()
    singleShippingPrice: number;

    @Prop()
    landingPage: boolean;

    @Prop()
    landingPageColor: boolean;

    @Prop()
    landingPageColorValue: string;

    @Prop({
        type: {
            multiSelect: { type: Boolean },
            list: [
                {
                    hex: { type: String },
                    colorSku: { type: String, trim: true },
                    name: { type: String },
                },
            ],
        },
    })
    colors?: {
        multiSelect: boolean;
        list: [
            {
                hex: string;
                colorSku?: string;
                name: string;
            },
        ];
    };

    @Prop({ required: true })
    imageCover: string;

    @Prop({ type: [{ imageUrl: String }] })
    images: [
        {
            imageUrl: string;
        },
    ];

    @Prop()
    category: string;

    @Prop({
        type: [
            {
                title: { type: String },
                multiSelect: { type: Boolean },
                properties: [
                    {
                        name: { type: String },
                        hasIcon: { type: Boolean },
                        propertySku: { type: String, trim: true },
                        iconUrl: { type: String },
                    },
                ],
            },
        ],
    })
    otherProperties?: [
        {
            title: string;
            multiSelect: boolean;
            properties: [
                {
                    name: string;
                    hasIcon: boolean;
                    propertySku?: string;
                    iconUrl: string;
                },
            ];
        },
    ];

    @Prop()
    rating: number;

    @Prop()
    oldPrice: number;

    @Prop({ trim: true })
    slug: string;

    @Prop({
        type: [
            {
                offerName: { type: String },
                quanitity: { type: Number },
                offerProductPrice: { type: Number },
                freeShipping: { type: Boolean },
                oldPrice: { type: Number },
                bestOffer: { type: Boolean },
                defaultSelect: { type: Boolean },
            },
        ],
    })
    offers?: [
        {
            offerName: string;
            quanitity: number;
            offerProductPrice: number;
            freeShipping: boolean;
            oldPrice: number;
            bestOffer: boolean;
            defaultSelect: boolean;
        },
    ];

    @Prop()
    allowReviews: boolean;

    @Prop({
        type: [
            {
                isMale: { type: Boolean },
                isFemale: { type: Boolean },
                allowRaterProfileImage: { type: Boolean },
                raterProfileImage: { type: String },
                raterName: { type: String },
                rating: { type: Number },
                review: { type: String },
                imageUrl: { type: String },
            },
        ],
    })
    reviews?: {
        isMale: boolean;
        isFemale: boolean;
        allowRaterProfileImage: boolean;
        raterProfileImage: string;
        raterName: string;
        rating: number;
        review: string;
        imageUrl: string;
    }[];

    @Prop()
    productDesc: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: function () {
            return this._id;
        },
    })
    id?: string;
    _id?: string;
}

export const StoreProductSchema = SchemaFactory.createForClass(StoreProduct);
