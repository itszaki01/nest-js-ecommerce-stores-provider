import { Module } from "@nestjs/common";
import { StoreProductService } from "./store-product.service";
import { StoreProductController } from "./store-product.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { StoreProduct, StoreProductSchema } from "./schema/store-product.schema";
import { StoreProductPublicController } from "./store-product-public.controller";
import { StoreDomainModule } from "../store-domain/store-domain.module";

@Module({
    imports: [StoreDomainModule, MongooseModule.forFeature([{ name: StoreProduct.name, schema: StoreProductSchema }])],
    controllers: [StoreProductController, StoreProductPublicController],
    providers: [StoreProductService],
    exports:[StoreProductService]
})
export class StoreProductModule {}
