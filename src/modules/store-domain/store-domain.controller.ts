import { Controller, Get, Post, Body, Param, Delete, Query } from "@nestjs/common";
import { StoreDomainService } from "./store-domain.service";
import { CreateStoreDomainDto } from "./dto/create-store-domain.dto";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { TQueryParams } from "src/@types/QueryParams.type";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";

@UserStoreAuth("StoreAdmin")
@Controller("store-domain")
export class StoreDomainController {
    constructor(private readonly storeDomainService: StoreDomainService) {}

    @Post()
    create(@Body() createStoreDomainDto: CreateStoreDomainDto, @StoreUser("storeId") storeId: string) {
        return this.storeDomainService.create(createStoreDomainDto, storeId);
    }

    @Get()
    findAll(@StoreUser("storeId", ParseMongoIdPipe) storeId: string, @Query() queryParams: TQueryParams) {
        return this.storeDomainService.findAll(storeId, queryParams);
    }

    @Get("verify/:domainId")
    verifyDomain(@Param("domainId") domainId: string) {
        return this.storeDomainService.verifyDomain(domainId);
    }

    @Delete(":domainId")
    remove(@Param("domainId", ParseMongoIdPipe) domainId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeDomainService.removeOneByPayload(domainId, storeId);
    }
}
