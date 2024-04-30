import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";

export type StoreApplicationsDocument = HydratedDocument<StoreApplications>;

@Schema({ timestamps: true })
export class StoreApplications {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;

    @Prop()
    allowFacebookConvApis: boolean;

    @Prop({
        type: [
            {
                pixelId: { type: String },
                access_token: { type: String },
                allowTestMode: Boolean,
                testCode: { type: String },
            },
        ],
    })
    facebookConvApis: { pixelId: string; access_token: string; allowTestMode: boolean; testCode: string }[];

    @Prop()
    allowGoogleSheetsApis: boolean;

    @Prop({
        type: [
            {
                apiKey: { type: String },
            },
        ],
    })
    googleSheetsApis: { apiKey: string }[];

    @Prop()
    allowTikTokConvApis: boolean;

    @Prop({
        type: [
            {
                pixelId: { type: String, trim: true },
                access_token: { type: String, trim: true },
                allowTestMode: Boolean,
                testCode: { type: String, trim: true },
            },
        ],
    })
    tikTokConvApis: { pixelId: string; access_token: string; allowTestMode: boolean; testCode: string }[];

    _id?:string
}

export const StoreApplicationsSchema = SchemaFactory.createForClass(StoreApplications);
