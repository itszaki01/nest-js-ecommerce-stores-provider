import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { StoreProductService } from "./store-product.service";
import { CreateStoreProductDto } from "./dto/create-store-product.dto";
import { UpdateStoreProductDto } from "./dto/update-store-product.dto";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { TQueryParams } from "src/@types/QueryParams.type";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";

@UserStoreAuth("StoreAdmin", "StoreManager")
@Controller("store-product")
export class StoreProductController {
    constructor(private readonly storeProductService: StoreProductService) {}

    @Post()
    create(@Body() createStoreProductDto: CreateStoreProductDto, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeProductService.create(createStoreProductDto, storeId);
    }

    @Get()
    findAll(
        @StoreUser("storeId", ParseMongoIdPipe) storeId: string,
        @Query() queryParams: TQueryParams
    ) {
        return this.storeProductService.findAll(storeId, queryParams);
    }

    @Get(":productId")
    findOne(@Param("productId", ParseMongoIdPipe) productId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeProductService.findOneByPayload(productId, storeId);
    }

    @Patch(":productId")
    update(
        @Param("productId", ParseMongoIdPipe) productId: string,
        @StoreUser("storeId", ParseMongoIdPipe) storeId: string,
        @Body() updateStoreProductDto: UpdateStoreProductDto
    ) {
        return this.storeProductService.updateOneByPayload(productId, storeId, updateStoreProductDto);
    }

    @Delete(":productId")
    remove(@Param("productId", ParseMongoIdPipe) productId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeProductService.removeOneByPayload(productId, storeId);
    }
}
