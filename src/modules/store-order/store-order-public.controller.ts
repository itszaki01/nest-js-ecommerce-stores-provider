import { Body, Controller, Post, Req } from "@nestjs/common";
import { StoreOrderService } from "./store-order.service";
import { StoreDomainService } from "../store-domain/store-domain.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { StoreService } from "../store/store.service";
import { CreateStoreOrderPublicDto } from "./dto/create-store-order-public.dto";
import { FastifyRequest } from "fastify";
import { Throttle } from "@nestjs/throttler";

@Controller("store-order-public")
export class StoreOrderPublicController {
    constructor(
        private readonly storeOrderService: StoreOrderService,
        private readonly storeDomainService: StoreDomainService,
        private readonly storeService: StoreService
    ) {}

    @Throttle({ default: { limit: EnviromentsClass.NODE_ENV === "DEV" ? 999999 : 5, ttl: 3600000 } })
    @Post()
    async createPublicOrder(@Req() req: FastifyRequest, @Body() createStoreOrderPublicDto: CreateStoreOrderPublicDto) {
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

        return this.storeOrderService.createPublicOrder(createStoreOrderPublicDto, storeId, req);
    }

    @Throttle({ default: { limit: EnviromentsClass.NODE_ENV === "DEV" ? 999999 : 15, ttl: 3600000 } })
    @Post("cart")
    async createPublicCartOrder(@Req() req: FastifyRequest, @Body() createStoreOrderPublicDto: CreateStoreOrderPublicDto) {
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

        return this.storeOrderService.createPublicOrder(createStoreOrderPublicDto, storeId, req);
    }

    @Throttle({ default: { limit: 2, ttl: 3600000 } })
    @Post("uncompleted")
    async createPublicOrderUncompleted(@Req() req: FastifyRequest, @Body() createStoreOrderPublicDto: CreateStoreOrderPublicDto) {
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

        return this.storeOrderService.createPublicOrder(createStoreOrderPublicDto, storeId, req);
    }
}
