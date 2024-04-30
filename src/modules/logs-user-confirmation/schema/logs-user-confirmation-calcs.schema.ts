import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { UserConfirmation } from 'src/modules/user-confirmation/schema/user-confirmation.schema';

export type LogsUserConfirmationCaclsDocument = HydratedDocument<LogsUserConfirmationCacls>

@Schema({ timestamps: true })
export class LogsUserConfirmationCacls {
    @Prop()
    userName: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserConfirmation.name })
    userConfirmation: string;

    @Prop()
    logText: string;

    @Prop()
    paymentAmount:number

    @Prop({
        type: Date,
        default: new Date(Date.now() + 3600 * 1000 * 8640),
        index: { expireAfterSeconds: 31104000 },
    })
    expireAt?: Date;
}

export const LogsUserConfirmationCaclsSchema = SchemaFactory.createForClass(LogsUserConfirmationCacls);