import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";

export type StoreCategoryDocument = HydratedDocument<StoreCategory>;

@Schema({ timestamps: true })
export class StoreCategory {
    @Prop({ required: true,trim:true })
    name: string;

    @Prop({ required: true })
    iconUrl: string;

    @Prop({
        type: mongoose.Types.ObjectId,
        default: (function () {
            return this._id;
        })
    })
    id?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;

    _id?:string
}

export const StoreCategorySchema = SchemaFactory.createForClass(StoreCategory);
