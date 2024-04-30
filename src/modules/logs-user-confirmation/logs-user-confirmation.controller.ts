import { Controller, Get, Query } from "@nestjs/common";
import { LogsUserConfirmationService } from "./logs-user-confirmation.service";
import { TQueryParams } from "src/@types/QueryParams.type";
import { UserCompanyAuth } from "../auth-company-user/decorator/user-company-auth.decorator";
import { SkipThrottle } from "@nestjs/throttler";


@SkipThrottle()
@Controller("logs-user-confirmation")
export class LogsUserConfirmationController {
    constructor(private readonly logsUserConfirmationService: LogsUserConfirmationService) {}

    @Get("calcs")
    @UserCompanyAuth("CompanyOwner", "CopmanyAccountant")
    findAllCaclsLogs(@Query() queryParams: TQueryParams) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, searchKey, ...rest } = queryParams;
        return this.logsUserConfirmationService.findAllCalcsLogsUserConfirmation(queryParams, rest);
    }

    @Get("orders")
    @UserCompanyAuth("CompanyOwner", "CompanyManager")
    findAllOrdersLogs(@Query() queryParams: TQueryParams) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, searchKey, ...rest } = queryParams;
        return this.logsUserConfirmationService.findAllOrdersLogsUserConfirmation(queryParams, rest);
    }
}
