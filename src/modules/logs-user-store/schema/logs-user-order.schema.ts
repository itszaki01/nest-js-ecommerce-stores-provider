import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";
import { UserStore } from "src/modules/user-store/schema/user-store.schema";

export type LogsUserStoreOrderDocument = HydratedDocument<LogsUserStoreOrder>;

@Schema({ timestamps: true })
export class LogsUserStoreOrder {
    @Prop({ enum: ["تحديث", "إنشاء", "حذف", "شحن", "إلغاء"] })
    actionType: "تحديث" | "إنشاء" | "حذف" | "شحن" | "إلغاء";

    @Prop()
    userName: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserStore.name })
    userStore: string;

    @Prop()
    clientPhoneNumber: string;

    @Prop()
    clientLocation: string;

    @Prop()
    clientTotalOrder: number;

    @Prop()
    clientName: string;

    @Prop()
    productName: string;

    @Prop()
    logText: string;

    @Prop()
    orderTracking?: string;

    @Prop({
        type: Date,
        default: new Date(Date.now() + 3600 * 1000 * 8640),
        index: { expireAfterSeconds: 31104000 },
    })
    expireAt?: Date;
}

export const LogsUserStoreOrderSchema = SchemaFactory.createForClass(LogsUserStoreOrder);
