import {  Module, forwardRef } from "@nestjs/common";
import { StoreOrderService } from "./store-order.service";
import { StoreOrderController } from "./store-order.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { StoreOrder, StoreOrderSchema } from "./schema/store-order.schema";
import { StoreProductModule } from "../store-product/store-product.module";
import { StoreOrderPublicController } from "./store-order-public.controller";
import { StoreDomainModule } from "../store-domain/store-domain.module";
import { ApiModule } from "src/api/api.module";
import { SocialmediaConversionApiModule } from "../socialmedia-conversion-api/socialmedia-conversion-api.module";
import { StoreApplications, StoreApplicationsSchema } from "../store-applications/scheam/store-application.schema";
import { UserStore, UserStoreSchema } from "../user-store/schema/user-store.schema";
import { StoreOrderUserConfirmationController } from "./store-order-user-confirmation.controller";
import { UserCompanyModule } from "../user-company/user-company.module";
import { UserConfirmationModule } from "../user-confirmation/user-confirmation.module";
import { LogsUserConfirmationModule } from "../logs-user-confirmation/logs-user-confirmation.module";
import { CompanyModule } from "../company/company.module";
import { UserConfirmation, UserConfirmationSchema } from "../user-confirmation/schema/user-confirmation.schema";


@Module({
    imports: [
        forwardRef(()=> ApiModule),
        StoreProductModule,
        SocialmediaConversionApiModule,
        StoreDomainModule,
        UserCompanyModule,
        forwardRef(()=> UserConfirmationModule),
        LogsUserConfirmationModule,
        CompanyModule,
        MongooseModule.forFeatureAsync([
            {
                name: StoreOrder.name,
                useFactory: () => {
                    const schema = StoreOrderSchema;

                    schema.pre(/^find/, function (next) {
                        //@ts-expect-error just bug
                        this.populate("productId", "imageCover productShortName");
                        //@ts-expect-error just bug
                        this.populate("locationId", "locationIndex locationName");
                        //@ts-expect-error just bug
                        this.populate("store", "storeTitle");
                        next();
                    });
                    return schema;
                },
            },
            {
                name: StoreApplications.name,
                useFactory: () => {
                    const schema = StoreApplicationsSchema;
                    return schema;
                },
            },
            {
                name: UserConfirmation.name,
                useFactory: () => {
                    const schema = UserConfirmationSchema;
                    return schema;
                },
            },
            {
                name: UserStore.name,
                useFactory: () => {
                    const schema = UserStoreSchema;
                    return schema;
                },
            },
        ]),
    ],
    controllers: [StoreOrderController, StoreOrderPublicController, StoreOrderUserConfirmationController],
    providers: [StoreOrderService],
    exports: [StoreOrderService],
})
export class StoreOrderModule {}
