import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { UserCompany } from 'src/modules/user-company/schema/user-company.schema'
import { UserStopDesk } from 'src/modules/user-stop-desk/schema/user-stop-desk.schema'

export type LogsCompanyCalcsDocument = HydratedDocument<LogsCompanyCalcs>

@Schema({ timestamps: true })
export class LogsCompanyCalcs {
    @Prop({type:mongoose.Schema.Types.ObjectId, ref:UserCompany.name})
    userCompany:string

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:UserStopDesk.name})
    userStopDesk:string

    @Prop()
    userName:string
    
    @Prop()
    stopDeskName:string

    @Prop()
    paymentAmount:number

    @Prop()
    textLog:string

    @Prop({
        type: Date,
        default: new Date(Date.now() + 3600 * 1000 * 8640),
        index: { expireAfterSeconds: 31104000 },
    })
    expireAt?: Date;
}

export const LogsCompanyCalcsSchema = SchemaFactory.createForClass(LogsCompanyCalcs);