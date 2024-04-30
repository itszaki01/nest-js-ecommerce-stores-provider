import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Store } from 'src/modules/store/schema/store.schema';
import { UserStore } from 'src/modules/user-store/schema/user-store.schema';

export type LogsUserStoreCaclsDocument = HydratedDocument<LogsUserStoreCacls>

@Schema({ timestamps: true })
export class LogsUserStoreCacls {
    @Prop()
    userName: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
    store: string;
    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserStore.name })
    userStore: string;

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

export const LogsUserStoreCaclsSchema = SchemaFactory.createForClass(LogsUserStoreCacls);