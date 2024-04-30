import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Store } from "src/modules/store/schema/store.schema";
import { UserStopDesk } from "src/modules/user-stop-desk/schema/user-stop-desk.schema";

export type LogsStopDeskCalcsDocument = HydratedDocument<LogsStopDeskCalcs>;

@Schema({ timestamps: true })
export class LogsStopDeskCalcs {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserStopDesk.name })
    userStopDesk: string;

    @Prop()
    paymentAmount: number;

    @Prop({ enum: ["خدمة المتجر الإلكتروني", "خدمة تأكيد الطلبات", "الإشتراك الشهري للمتجر"] })
    serviceType: "خدمة المتجر الإلكتروني" | "خدمة تأكيد الطلبات" | "الإشتراك الشهري للمتجر";

    @Prop()
    storeName: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;

    @Prop()
    logText: string;

    @Prop({ default: false })
    isCompanyCalced: boolean;

    @Prop({
        type: Date,
        default: new Date(Date.now() + 3600 * 1000 * 8640),
        index: { expireAfterSeconds: 31104000 },
    })
    expireAt?: Date;
}

export const LogsStopDeskCalcsSchema = SchemaFactory.createForClass(LogsStopDeskCalcs);
