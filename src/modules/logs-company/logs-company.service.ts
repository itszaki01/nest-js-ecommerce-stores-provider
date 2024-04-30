import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { LogsCompany } from "./schema/logs-company.schema";
import { Model } from "mongoose";
import { HandlersFactory } from "src/utils/handlersFactory";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import { LogsCompanyCalcs } from "./schema/logs-company-calcs.schema";

@Injectable()
export class LogsCompanyService {
    constructor(
        @InjectModel(LogsCompany.name) private logsCompanyModel: Model<LogsCompany>,
        @InjectModel(LogsCompanyCalcs.name) private logsCompanyCalcsModel: Model<LogsCompanyCalcs>
    ) {}

    createUserCompanyActionLog(userCompanyId: string, actionType: "تحديث" | "إنشاء" | "إلغاء" | "تفعيل" | 'حذف', textLog: string, userName: string) {
        return HandlersFactory.create(this.logsCompanyModel, { userCompany: userCompanyId, textLog, actionType, userName });
    }

    createCompanyCalcsLog(
        userCompanyId: string,
        stopDeskId: string,
        paymentAmount: number = 0,
        textLog: string,
        stopDeskName: string,
        userName: string
    ) {
        return HandlersFactory.create(this.logsCompanyCalcsModel, {
            userCompany: userCompanyId,
            paymentAmount,
            textLog,
            userStopDesk: stopDeskId,
            stopDeskName,
            userName,
        });
    }

    async findAllUserCompanyActionsLogs(queryParams: TQueryParams, payload: Partial<LogsCompany>) {
        const apiFeatures = await apiFeaturesHelper(this.logsCompanyModel, this.logsCompanyModel, queryParams, {
            ...payload,
        });
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }
    async findAllStopDeskPaidStoresPaymentsCalcsLogs(queryParams: TQueryParams, payload: Partial<LogsCompanyCalcs>) {
        const apiFeatures = await apiFeaturesHelper(this.logsCompanyCalcsModel, this.logsCompanyCalcsModel, queryParams, {
            ...payload,
        });
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }
}
