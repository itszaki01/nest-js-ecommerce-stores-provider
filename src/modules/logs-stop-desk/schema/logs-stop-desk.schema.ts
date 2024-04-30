import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";
import { UserStopDesk } from "src/modules/user-stop-desk/schema/user-stop-desk.schema";

export type LogsStopDeskDocument = HydratedDocument<LogsStopDesk>;

@Schema({ timestamps: true })
export class LogsStopDesk {
    @Prop({ enum: ["تحديث", "إنشاء", "إلغاء", "تفعيل"] })
    actionType: "تحديث" | "إنشاء" | "إلغاء" | "تفعيل";

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserStopDesk.name })
    userStopDesk: string;

    @Prop()
    storeName: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;

    @Prop()
    logText: string;

    @Prop({
        type: Date,
        default: new Date(Date.now() + 3600 * 1000 * 8640),
        index: { expireAfterSeconds: 31104000 },
    })
    expireAt?: Date;
}

export const LogsStopDeskSchema = SchemaFactory.createForClass(LogsStopDesk);
