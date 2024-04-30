import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";

export type StoreLocationDocument = HydratedDocument<StoreLocation>;

@Schema({ timestamps: true })
export class StoreLocation {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;

    @Prop()
    locationIndex: number;

    @Prop({trim:true})
    locationName: string;

    @Prop()
    isActive: boolean;

    @Prop()
    ToHome: boolean;

    @Prop()
    shippingToHomePrice: number;

    @Prop()
    shippingToHomeFakePrice: number;

    @Prop()
    ToStopDesk: boolean;

    @Prop()
    shippingToStopDeskPrice: number;

    @Prop()
    shippingToStopDeskFakePrice: number;

    @Prop({trim:true})
    StopDeskAddress: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: function () {
            return this._id;
        },
    })
    id?: string;

    _id?: string;
}

export const StoreLocationSchema = SchemaFactory.createForClass(StoreLocation);
