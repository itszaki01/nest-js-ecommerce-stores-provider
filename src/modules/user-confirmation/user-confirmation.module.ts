import { Module, forwardRef } from "@nestjs/common";
import { UserConfirmationService } from "./user-confirmation.service";
import { UserConfirmationController } from "./user-confirmation.controller";
import { UserCompanyModule } from "../user-company/user-company.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserConfirmation, UserConfirmationSchema } from "./schema/user-confirmation.schema";
import { StoreOrder, StoreOrderSchema } from "../store-order/schema/store-order.schema";
import { FindOneUserConfirmationController } from "./find-one-user-confirmation.controller";
import { StoreOrderModule } from "../store-order/store-order.module";

@Module({
    imports: [
        UserCompanyModule,
        forwardRef(() => StoreOrderModule),
        MongooseModule.forFeature([
            { name: UserConfirmation.name, schema: UserConfirmationSchema },
            { name: StoreOrder.name, schema: StoreOrderSchema },
        ]),
    ],
    controllers: [UserConfirmationController, FindOneUserConfirmationController],
    providers: [UserConfirmationService],
    exports: [UserConfirmationService],
})
export class UserConfirmationModule {}
