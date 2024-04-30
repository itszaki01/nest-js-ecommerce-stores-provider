import { Module } from "@nestjs/common";
import { StoreCategoryService } from "./store-category.service";
import { StoreCategoryController } from "./store-category.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { StoreCategory, StoreCategorySchema } from "./schema/store-category.schema";
import { StoreDomainModule } from "../store-domain/store-domain.module";
import { StoreCategoryPublicController } from "./store-category-public.controller";

@Module({
    imports: [StoreDomainModule, MongooseModule.forFeature([{ name: StoreCategory.name, schema: StoreCategorySchema }])],
    controllers: [StoreCategoryController, StoreCategoryPublicController],
    providers: [StoreCategoryService],
})
export class StoreCategoryModule {}
