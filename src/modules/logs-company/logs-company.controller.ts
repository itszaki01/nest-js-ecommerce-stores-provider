import { BadRequestException, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { LogsCompanyService } from "./logs-company.service";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { LogsStopDeskService } from "../logs-stop-desk/logs-stop-desk.service";
import { TQueryParams } from "src/@types/QueryParams.type";
import { LogsStopDeskCalcs } from "../logs-stop-desk/schema/logs-stop-desk-calcs.schema";
import { UserCompanyAuth } from "../auth-company-user/decorator/user-company-auth.decorator";
import { UserStopDeskService } from "../user-stop-desk/user-stop-desk.service";
import { CompanyUser } from "../auth-company-user/decorator/company-user.decorator";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { UserCompany } from "../user-company/schema/user-company.schema";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("logs-company")
export class LogsCompanyController {
    constructor(
        private readonly logsCompanyService: LogsCompanyService,
        private readonly logsStopDeskService: LogsStopDeskService,
        private readonly userStopDeskService: UserStopDeskService,
        private readonly twoFactoryService: TwoFactoryService
    ) {}

    @UserCompanyAuth("CompanyOwner", "CompanyManager")
    @Get("get-all-user-company-actions-logs")
    findAllUserCompanyActionsLogs(@Query() queryParams: TQueryParams) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, searchKey, ...rest } = queryParams;
        return this.logsCompanyService.findAllUserCompanyActionsLogs(queryParams, rest);
    }

    @UserCompanyAuth("CompanyOwner", "CopmanyAccountant")
    @Get("get-all-stop-desk-stores-payments-calcs-logs")
    findAllStopDeskStoresPaymentsCalcsLogs(@Query() queryParams: TQueryParams) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, searchKey, ...rest } = queryParams;
        return this.logsCompanyService.findAllStopDeskPaidStoresPaymentsCalcsLogs(queryParams, rest);
    }

    @UserCompanyAuth("CompanyOwner", "CopmanyAccountant")
    @Get("get-stop-desks-stores-payments/:stopDeskId")
    findAllUnClearedStopDeskStoresPayments(@Param("stopDeskId", ParseMongoIdPipe) stopDeskId: string, @Query() queryParams: TQueryParams) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { limit, page, sort, fields, searchMethod, id, keyword, dateRange, ...rest } = queryParams;
        return this.logsStopDeskService.findAllUnClearedStoresCalcsLog(stopDeskId, queryParams, rest as Partial<LogsStopDeskCalcs>);
    }

    @UserCompanyAuth("CompanyOwner", "CopmanyAccountant")
    @Post("clear-stop-desk-stores-payments-calcs/:stopDeskId")
    async clearAllStopDeskStoresPaymentsCalcs(
        @Param("stopDeskId", ParseMongoIdPipe) stopDeskId: string,
        @CompanyUser() companyUser: Readonly<UserCompany>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
  
        //2: Validate TwoFactory Code
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(companyUser.twoFactorySecretCode, twoFactoryCode);
        }

        //3: Get Desk
        const stopDesk = await this.userStopDeskService.findOne(stopDeskId);

        if(stopDesk.totalUnPaidStoresPayments === 0){
            throw new BadRequestException('حساب المكتب يساوي 0')
        }

        //4:clear stopDesk Stores Logs
        await this.logsStopDeskService.clearStopDeskStoresPaymentsCalcs(stopDeskId);

        //5:reset stopDesk total payments prices
        await this.userStopDeskService.update(stopDeskId, { totalUnPaidStoresNumber: 0, totalUnPaidStoresPayments: 0 });

        //5: Log Action
        const log = await this.logsCompanyService.createCompanyCalcsLog(
            companyUser._id as string,
            stopDeskId,
            stopDesk.totalUnPaidStoresPayments,
            `تم تصفية حسابات المكتب ${stopDesk.stopDeskName} من ${stopDesk.totalUnPaidStoresPayments} دج إلى ===> 0 دج بواسطة ${companyUser.name}`,
            stopDesk.stopDeskName,
            companyUser.name
        );

        return log;
    }
}
