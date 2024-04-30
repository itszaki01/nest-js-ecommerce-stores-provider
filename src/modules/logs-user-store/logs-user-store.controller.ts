import { Controller, Get, Query } from "@nestjs/common";
import { LogsUserStoreService } from "./logs-user-store.service";
import { TQueryParams } from "src/@types/QueryParams.type";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";
import { StoreObject } from "../store/decorator/store-objcet.decorator";
import { Store } from "../store/schema/store.schema";

@UserStoreAuth("StoreAdmin")
@Controller("logs-user-store")
export class LogsUserStoreController {
    constructor(private readonly logsUserStoreService: LogsUserStoreService) {}

    @Get()
    findAll(@Query() queryParams: TQueryParams, @StoreObject() store: Readonly<Store>) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, searchKey, ...rest } = queryParams;
        return this.logsUserStoreService.findAllLogsUserStore(store._id as string, queryParams, rest);
    }

    @Get("calcs")
    @UserStoreAuth('StoreAdmin','StoreAccountent')
    findAllCaclsLogs(@Query() queryParams: TQueryParams, @StoreObject() store: Readonly<Store>) {
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, searchKey, ...rest } = queryParams;
        return this.logsUserStoreService.findAllCalcsLogsUserStore(store._id as string, queryParams, rest);
    }

    @Get("orders")
    findAllOrdersLogs(@Query() queryParams: TQueryParams, @StoreObject() store: Readonly<Store>) {
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, searchKey, ...rest } = queryParams;
        return this.logsUserStoreService.findAllOrdersLogsUserStore(store._id as string, queryParams, rest);
    }
}
