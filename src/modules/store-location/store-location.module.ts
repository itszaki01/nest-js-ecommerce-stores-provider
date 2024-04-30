import { Module } from "@nestjs/common";
import { StoreLocationService } from "./store-location.service";
import { StoreLocationController } from "./store-location.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { StoreLocation, StoreLocationSchema } from "./schema/store-location.schema";
import { StoreLocationPublicController } from "./store-location-public.controller";
import { StoreDomainModule } from "../store-domain/store-domain.module";

@Module({
    imports: [ StoreDomainModule, MongooseModule.forFeature([{ name: StoreLocation.name, schema: StoreLocationSchema }])],
    controllers: [StoreLocationController, StoreLocationPublicController],
    providers: [StoreLocationService],
    exports: [StoreLocationService],
})
export class StoreLocationModule {}
