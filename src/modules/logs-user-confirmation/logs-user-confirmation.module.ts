import { Global, Module } from "@nestjs/common";
import { LogsUserConfirmationService } from "./logs-user-confirmation.service";
import { LogsUserConfirmationController } from "./logs-user-confirmation.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { LogsUserConfirmationCacls, LogsUserConfirmationCaclsSchema } from "./schema/logs-user-confirmation-calcs.schema";
import { LogsUserConfirmationOrder, LogsUserConfirmationOrderSchema } from "./schema/logs-user-confirmation-order.schema";
import { UserCompanyModule } from "../user-company/user-company.module";

@Global()
@Module({
    imports: [
        UserCompanyModule,
        MongooseModule.forFeature([
            { name: LogsUserConfirmationOrder.name, schema: LogsUserConfirmationOrderSchema },
            { name: LogsUserConfirmationCacls.name, schema: LogsUserConfirmationCaclsSchema },
        ]),
    ],
    controllers: [LogsUserConfirmationController],
    providers: [LogsUserConfirmationService],
    exports:[LogsUserConfirmationService]
})
export class LogsUserConfirmationModule {}
