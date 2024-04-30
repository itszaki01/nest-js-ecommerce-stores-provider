import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { LogsStopDeskService } from "./logs-stop-desk.service";
import { AuthStopDeskGuard } from "../auth-stop-desk-user/guards/auth-stop-desk-user.guard";
import { StopDeskUser } from "../auth-stop-desk-user/decorators/stop-desk-user.decorator";
import { TQueryParams } from "src/@types/QueryParams.type";
import { LogsStopDesk } from "./schema/logs-stop-desk.schema";
import { LogsStopDeskCalcs } from "./schema/logs-stop-desk-calcs.schema";

@UseGuards(AuthStopDeskGuard)
@Controller("logs-stop-desk")
export class LogsStopDeskController {
    constructor(private readonly logsStopDeskService: LogsStopDeskService) {}

    @Get("stop-desk-actions-logs")
    findAllStopDeskActionsLogs(@StopDeskUser("userId") stopDeskId: string, @Query() queryParams: TQueryParams) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, ...rest } = queryParams;
        return this.logsStopDeskService.findAllStopDeskActionsLogs(stopDeskId, queryParams, rest as Partial<LogsStopDesk>);
    }

    @Get("store-calcs-logs")
    findAllStoresCalcsLog(@StopDeskUser("userId") stopDeskId: string, @Query() queryParams: TQueryParams) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, ...rest } = queryParams;
        return this.logsStopDeskService.findAllStoresCalcsLog(stopDeskId, queryParams, rest as Partial<LogsStopDeskCalcs>);
    }
}
