import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { UserStopDesk } from "src/modules/user-stop-desk/schema/user-stop-desk.schema";

export type UserStoreDocument = HydratedDocument<UserStore>;

@Schema({ timestamps: true })
export class UserStore {
    @Prop({ required: true,lowercase:true })
    userName: string;

    @Prop({ required: true, trim: true, unique: true,lowercase:true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    userPhoneNumber: string;

    @Prop({ default: false })
    isRoot?: boolean;

    @Prop({ default: new Date(Date.now()) })
    passwordChangedAt: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserStopDesk.name })
    stopDesk?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Store" })
    store: string;

    @Prop({ enum: ["StoreAdmin", "StoreManager", "StoreCallMember", "StoreAccountent"], default: "StoreAdmin" })
    role?: "StoreAdmin" | "StoreManager" | "StoreCallMember" | "StoreAccountent";

    @Prop({ default: true })
    isActive?: boolean;

    @Prop({ default: 0 })
    totalProfit: number;

    @Prop({ default: 0 })
    totalOrders: number;

    _id?: string;
}

export const UserStoreSchema = SchemaFactory.createForClass(UserStore);
