import { Global, Module, forwardRef } from "@nestjs/common";
import { StoreService } from "./store.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Store, StoreSchema } from "./schema/store.schema";
import { UserStore, UserStoreSchema } from "../user-store/schema/user-store.schema";
import { UserStopDeskModule } from "../user-stop-desk/user-stop-desk.module";
import { StoreStopDeskController } from "./store-stop-desk.controller";
import { StoreUserController } from "./store-user.controller";
import { StoreLocationModule } from "../store-location/store-location.module";
import { StorePageModule } from "../store-page/store-page.module";
import { StorePublicController } from "./store-public.controller";
import { StoreDomainModule } from "../store-domain/store-domain.module";
import { CompanyModule } from "../company/company.module";
import { ApiModule } from "src/api/api.module";
import { StoreOrderModule } from "../store-order/store-order.module";
import { StoreOrder, StoreOrderSchema } from "../store-order/schema/store-order.schema";
import { StoreStopDeskService } from "./store-stop-desk.service";

@Global()
@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Store.name,
                useFactory: () => {
                    const schema = StoreSchema;
                    schema.pre(/^find/, function (next) {
                        //@ts-expect-error just bug
                        this.populate("storeOwner", ["email", "userName", "userPhoneNumber"]);
                        //@ts-expect-error just bug
                        this.populate("createdByStopDesk", "stopDeskName stopDeskPhoneNumber1 stopDeskPhoneNumber2");
                        next();
                    });
                    return schema;
                },
            },
            { name: UserStore.name, useFactory: () => UserStoreSchema },
            { name: StoreOrder.name, useFactory: () => StoreOrderSchema },
        ]),
        UserStopDeskModule,
        StoreLocationModule,
        StorePageModule,
        StoreDomainModule,
        forwardRef(()=> StoreOrderModule),
        CompanyModule,
        forwardRef(()=> ApiModule),
    ],
    controllers: [StoreStopDeskController, StoreUserController, StorePublicController],
    providers: [StoreService,StoreStopDeskService],
    exports: [StoreService,StoreStopDeskService],
})
export class StoreModule {}
