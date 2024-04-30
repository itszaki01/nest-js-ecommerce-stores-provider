import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";

export type StorePageDocument = HydratedDocument<StorePage>;

@Schema({ timestamps: true })
export class StorePage {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store?: string;

    @Prop({ required: true })
    title: string;

    @Prop()
    pageIndex:number

    @Prop()
    showPage: boolean;

    @Prop({ required: true,trim:true })
    slug: string;

    @Prop({ required: true })
    body: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        default: function () {
            return this._id;
        },
    })
    id?: string;

    _id?: string;
}

export const StorePageSchema = SchemaFactory.createForClass(StorePage);
