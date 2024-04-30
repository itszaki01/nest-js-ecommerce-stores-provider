import { Global, Module } from "@nestjs/common";
import { LogsUserStoreService } from "./logs-user-store.service";
import { LogsUserStoreController } from "./logs-user-store.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { LogsUserStore, LogsUserStoreSchema } from "./schema/logs-user-store.schema";
import { LogsUserStoreCacls, LogsUserStoreCaclsSchema } from "./schema/logs-user-store-calcs.schema";
import { LogsUserStoreOrder, LogsUserStoreOrderSchema } from "./schema/logs-user-order.schema";

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LogsUserStore.name, schema: LogsUserStoreSchema },
            { name: LogsUserStoreCacls.name, schema: LogsUserStoreCaclsSchema },
            { name: LogsUserStoreOrder.name, schema: LogsUserStoreOrderSchema },
        ]),
    ],
    controllers: [LogsUserStoreController],
    providers: [LogsUserStoreService],
    exports:[LogsUserStoreService]
})
export class LogsUserStoreModule {}
