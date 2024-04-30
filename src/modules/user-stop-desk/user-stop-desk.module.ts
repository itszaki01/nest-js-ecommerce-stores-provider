import { Module } from "@nestjs/common";
import { UserStopDeskService } from "./user-stop-desk.service";
import { UserStopDeskController } from "./user-stop-desk.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { UserStopDesk, UserStopDeskSchema } from "./schema/user-stop-desk.schema";
import { UserCompanyModule } from "../user-company/user-company.module";

@Module({
    imports: [UserCompanyModule,MongooseModule.forFeature([{ name: UserStopDesk.name, schema: UserStopDeskSchema }])],
    controllers: [UserStopDeskController],
    providers: [UserStopDeskService],
    exports: [UserStopDeskService],
})
export class UserStopDeskModule {}
