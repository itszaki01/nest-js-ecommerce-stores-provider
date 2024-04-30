import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { StorePageService } from "./store-page.service";
import { CreateStorePageDto } from "./dto/create-store-page.dto";
import { UpdateStorePageDto } from "./dto/update-store-page.dto";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { TQueryParams } from "src/@types/QueryParams.type";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";


@UserStoreAuth('StoreAdmin','StoreManager')
@Controller("store-page")
export class StorePageController {
    constructor(private readonly storePageService: StorePageService) {}

    @Post()
    create(@StoreUser("storeId", ParseMongoIdPipe) storeId: string, @Body() createStorePageDto: CreateStorePageDto) {
        return this.storePageService.create(createStorePageDto, storeId);
    }

    @Get()
    findAll(@StoreUser("storeId", ParseMongoIdPipe) storeId: string, @Query() queryParams: TQueryParams) {
        return this.storePageService.findAll(storeId, queryParams);
    }

    @Get(":storePageId")
    findOne(@Param("storePageId", ParseMongoIdPipe) storePageId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storePageService.findOneByPayload(storePageId, storeId);
    }

    @Patch(":storePageId")
    update(
        @Param("storePageId", ParseMongoIdPipe) storePageId: string,
        @StoreUser("storeId", ParseMongoIdPipe) storeId: string,
        @Body() updateStorePageDto: UpdateStorePageDto
    ) {
        return this.storePageService.updateOneByPayload(storePageId, storeId, updateStorePageDto);
    }

    @Delete(":storePageId")
    remove(@Param("storePageId", ParseMongoIdPipe) storePageId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storePageService.removeOneByPayload(storePageId, storeId);
    }
}
