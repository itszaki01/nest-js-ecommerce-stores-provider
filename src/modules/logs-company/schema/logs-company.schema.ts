import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { UserCompany } from "src/modules/user-company/schema/user-company.schema";

export type LogsCompanyDocument = HydratedDocument<LogsCompany>;

@Schema({ timestamps: true })
export class LogsCompany {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserCompany.name })
    userCompany: string;

    @Prop()
    userName: string;

    @Prop({ enum: ["تحديث", "إنشاء", "إلغاء", "تفعيل", "حذف"] })
    actionType: "تحديث" | "إنشاء" | "إلغاء" | "تفعيل" | "حذف";

    @Prop()
    textLog: string;

    @Prop({
        type: Date,
        default: new Date(Date.now() + 3600 * 1000 * 8640),
        index: { expireAfterSeconds: 31104000 },
    })
    expireAt?: Date;
}

export const LogsCompanySchema = SchemaFactory.createForClass(LogsCompany);
