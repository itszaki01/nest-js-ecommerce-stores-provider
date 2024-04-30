import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { StoreCategoryService } from "./store-category.service";
import { CreateStoreCategoryDto } from "./dto/create-store-category.dto";
import { UpdateStoreCategoryDto } from "./dto/update-store-category.dto";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";

@UserStoreAuth("StoreAdmin", "StoreManager")
@Controller("store-category")
export class StoreCategoryController {
    constructor(private readonly storeCategoryService: StoreCategoryService) {}

    @Post()
    create(@Body() createStoreCategoryDto: CreateStoreCategoryDto, @StoreUser("storeId") storeId: string) {
        return this.storeCategoryService.create(createStoreCategoryDto, storeId);
    }

    @Get()
    findAll(@StoreUser("storeId", ParseMongoIdPipe) storeId: string, @Query() queryParams: TQueryParams) {
        return this.storeCategoryService.findAll(storeId, queryParams);
    }

    @Get(":categoryId")
    findOne(@Param("categoryId", ParseMongoIdPipe) categoryId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeCategoryService.findOneByPayload(categoryId, storeId);
    }

    @Patch(":categoryId")
    update(
        @Param("categoryId", ParseMongoIdPipe) categoryId: string,
        @StoreUser("storeId", ParseMongoIdPipe) storeId: string,
        @Body() updateStoreCategoryDto: UpdateStoreCategoryDto
    ) {
        return this.storeCategoryService.updateOneByPayload(categoryId, storeId, updateStoreCategoryDto);
    }

    @Delete(":categoryId")
    remove(@Param("categoryId", ParseMongoIdPipe) categoryId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeCategoryService.removeOneByPayload(categoryId, storeId);
    }
}
