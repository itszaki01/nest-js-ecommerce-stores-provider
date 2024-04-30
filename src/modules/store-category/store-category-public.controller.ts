import { Controller, Get, Query, Req } from "@nestjs/common";
import { StoreCategoryService } from "./store-category.service";
import { TQueryParams } from "src/@types/QueryParams.type";
import { FastifyRequest } from "fastify";
import { StoreDomainService } from "../store-domain/store-domain.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { StoreService } from "../store/store.service";

@Controller("store-category-public")
export class StoreCategoryPublicController {
    constructor(
        private readonly storeCategoryService: StoreCategoryService,
        private readonly storeDomainService: StoreDomainService,
        private readonly storeService: StoreService
    ) {}

    @Get()
    async findAll(@Query() queryParams: TQueryParams, @Req() req: FastifyRequest) {
        let domainName = req.hostname;
        let storeId;
        if (EnviromentsClass.NODE_ENV === "DEV") {
            domainName = "localhost";
            storeId = (await this.storeDomainService.findOneByPayload(domainName)).store;
        } else if (domainName.includes(`.${EnviromentsClass.COMPANY_BASE_DOMAIN}`)) {
            domainName = req.hostname.replace(`.${EnviromentsClass.COMPANY_BASE_DOMAIN}`, "");
            storeId = (await this.storeService.findOneByPayload({ storeSubDomain: domainName }))._id.toString();
        } else {
            storeId = (await this.storeDomainService.findOneByPayload(domainName)).store;
        }

        return this.storeCategoryService.findAll(storeId, queryParams);
    }
}
