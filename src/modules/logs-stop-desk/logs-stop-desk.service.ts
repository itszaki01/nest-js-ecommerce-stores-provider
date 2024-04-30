import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LogsStopDesk } from "./schema/logs-stop-desk.schema";
import { HandlersFactory } from "src/utils/handlersFactory";
import { TQueryParams } from "src/@types/QueryParams.type";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { LogsStopDeskCalcs } from "./schema/logs-stop-desk-calcs.schema";
import { Store } from "../store/schema/store.schema";

@Injectable()
export class LogsStopDeskService {
    constructor(
        @InjectModel(LogsStopDesk.name) private logsStopDeskModel: Model<LogsStopDesk>,
        @InjectModel(LogsStopDeskCalcs.name) private losgStopDeskCalcsModel: Model<LogsStopDeskCalcs>,
    ) {}

    async createStopDeskActionLog(stopDeskId: string, store: Store, logText: string, actionType: "تحديث" | "إنشاء" | "إلغاء" | "تفعيل") {
        return HandlersFactory.create(this.logsStopDeskModel, {
            userStopDesk: stopDeskId,
            store: store._id as string,
            logText,
            actionType,
            storeName: store.storeSubDomain as string,
        });
    }

    async clearStopDeskStoresPaymentsCalcs(stopDeskId: string) {
        return await this.losgStopDeskCalcsModel.updateMany({ userStopDesk: stopDeskId }, { isCompanyCalced: true });
    }

    async createStopDeskClearCalcsLog(stopDeskId: string, store: Store, logText: string, totalUnpaidFees: number,serviceType:"خدمة المتجر الإلكتروني" | "خدمة تأكيد الطلبات" |  "الإشتراك الشهري للمتجر") {
        return HandlersFactory.create(this.losgStopDeskCalcsModel, {
            userStopDesk: stopDeskId,
            store: store._id as string,
            logText,
            storeName: store.storeSubDomain as string,
            isCompanyCalced: false,
            paymentAmount: totalUnpaidFees,
            serviceType
        });
    }

    async findAllStopDeskActionsLogs(stopDeskId: string, queryParams: TQueryParams, payload: Partial<LogsStopDesk>) {
        const apiFeatures = await apiFeaturesHelper(this.logsStopDeskModel, this.logsStopDeskModel, queryParams, {
            userStopDesk: stopDeskId,
            ...payload,
        });
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    async findAllStoresCalcsLog(stopDeskId: string, queryParams: TQueryParams, payload: Partial<LogsStopDeskCalcs>) {
        const apiFeatures = await apiFeaturesHelper(this.losgStopDeskCalcsModel, this.losgStopDeskCalcsModel, queryParams, {
            userStopDesk: stopDeskId,
            ...payload,
        });
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    async findAllUnClearedStoresCalcsLog(stopDeskId: string, queryParams: TQueryParams, payload: Partial<LogsStopDeskCalcs>) {
        const apiFeatures = await apiFeaturesHelper(this.losgStopDeskCalcsModel, this.losgStopDeskCalcsModel, queryParams, {
            userStopDesk: stopDeskId,
            ...payload,
            isCompanyCalced: false,
        });
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }
}
