import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { StoreLocationService } from "./store-location.service";
import { CreateStoreLocationDto } from "./dto/create-store-location.dto";
import { UpdateStoreLocationDto } from "./dto/update-store-location.dto";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";

@UserStoreAuth("StoreAdmin", "StoreManager")
@Controller("store-location")
export class StoreLocationController {
    constructor(private readonly storeLocationService: StoreLocationService) {}
    
    @Post()
    create(@StoreUser("storeId", ParseMongoIdPipe) storeId: string, @Body() createStoreLocationDto: CreateStoreLocationDto) {
        return this.storeLocationService.create(storeId, createStoreLocationDto);
    }
    
    @Post("create-bulk")
    createBulk(@StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeLocationService.createBulk(storeId);
    }
    
    @Get()
    @UserStoreAuth("StoreAdmin", "StoreManager","StoreCallMember")
    findAll(@StoreUser("storeId", ParseMongoIdPipe) storeId: string, @Query() queryParams: TQueryParams) {
        return this.storeLocationService.findAll(storeId, queryParams);
    }

    @Delete("/remove-all")
    removeAll(@StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeLocationService.removeAllByPayload(storeId);
    }

    @Get(":locationId")
    findOne(@Param("locationId", ParseMongoIdPipe) locationId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeLocationService.findOneByPayload(locationId, storeId);
    }

    @Patch(":locationId")
    update(
        @Param("locationId", ParseMongoIdPipe) locationId: string,
        @StoreUser("storeId", ParseMongoIdPipe) storeId: string,
        @Body() updateStoreLocationDto: UpdateStoreLocationDto
    ) {
        return this.storeLocationService.updateOneByPayload(locationId, storeId, updateStoreLocationDto);
    }

    @Delete(":locationId")
    remove(@Param("locationId", ParseMongoIdPipe) locationId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeLocationService.removeOneByPayload(locationId, storeId);
    }
}
