import { Module, forwardRef } from "@nestjs/common";
import { SafirClickService } from "./safir-click/safir-click.service";
import { ProColiService } from "./pro-coli/pro-coli.service";
import { ApiController } from "./api.controller";
import { UserStopDeskModule } from "src/modules/user-stop-desk/user-stop-desk.module";
import { StoreOrderModule } from "src/modules/store-order/store-order.module";
import { MongooseModule } from "@nestjs/mongoose";
import { StoreOrder, StoreOrderSchema } from "src/modules/store-order/schema/store-order.schema";
import { CompanyModule } from "src/modules/company/company.module";
import { UserStore, UserStoreSchema } from "src/modules/user-store/schema/user-store.schema";
import { UserConfirmation, UserConfirmationSchema } from "src/modules/user-confirmation/schema/user-confirmation.schema";
import { StoreProduct, StoreProductSchema } from "src/modules/store-product/schema/store-product.schema";
import { EcoTrackService } from "./eco-track/eco-track.service";
import { StoreLocationModule } from "src/modules/store-location/store-location.module";

@Module({
    imports: [
        UserStopDeskModule,
        forwardRef(() => StoreOrderModule),
        CompanyModule,
        StoreLocationModule,
        MongooseModule.forFeature([
            { name: StoreOrder.name, schema: StoreOrderSchema },
            { name: UserStore.name, schema: UserStoreSchema },
            { name: UserConfirmation.name, schema: UserConfirmationSchema },
            { name: StoreProduct.name, schema: StoreProductSchema },    
        ]),
    ],
    providers: [SafirClickService, ProColiService,EcoTrackService],
    exports: [SafirClickService, ProColiService,EcoTrackService],
    controllers: [ApiController],
})
export class ApiModule {}
