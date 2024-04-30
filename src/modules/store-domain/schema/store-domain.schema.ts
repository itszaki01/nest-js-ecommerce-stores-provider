import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";

export type StoreDomainDocument = HydratedDocument<StoreDomain>;

@Schema({ timestamps: true })
export class StoreDomain {
    @Prop({ unique: true,trim:true,lowercase:true })
    domainName: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;

    @Prop({ default: false })
    isVerified?: boolean;

    _id?: string;
}

export const StoreDomainSchema = SchemaFactory.createForClass(StoreDomain);
