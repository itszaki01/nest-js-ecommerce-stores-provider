import { Module } from "@nestjs/common";
import { StorePageService } from "./store-page.service";
import { StorePageController } from "./store-page.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { StorePage, StorePageSchema } from "./schema/store-page.schema";
import { StoreDomainModule } from "../store-domain/store-domain.module";
import { StorePagePublicController } from "./store-page-public.controller";

@Module({
    imports: [ StoreDomainModule, MongooseModule.forFeature([{ name: StorePage.name, schema: StorePageSchema }])],
    controllers: [StorePageController, StorePagePublicController],
    providers: [StorePageService],
    exports: [StorePageService],
})
export class StorePageModule {}
