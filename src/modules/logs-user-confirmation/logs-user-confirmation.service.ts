import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HandlersFactory } from "src/utils/handlersFactory";
import { LogsUserConfirmationCacls } from "./schema/logs-user-confirmation-calcs.schema";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import { LogsUserConfirmationOrder } from "./schema/logs-user-confirmation-order.schema";
import { StoreOrder } from "../store-order/schema/store-order.schema";
import { Store } from "../store/schema/store.schema";

@Injectable()
export class LogsUserConfirmationService {
    constructor(
        @InjectModel(LogsUserConfirmationCacls.name) private logsUserConfirmationCalcsModel: Model<LogsUserConfirmationCacls>,
        @InjectModel(LogsUserConfirmationOrder.name) private logsUserConfirmationOrderModel: Model<LogsUserConfirmationOrder>
    ) {}


    createCalcsLogUserConfirmation(userId: string, userName: string, logText: string, paymentAmount: number) {
        return HandlersFactory.create(this.logsUserConfirmationCalcsModel, {
            userName,
            userConfirmation: userId,
            logText,
            paymentAmount,
        });
    }

    createOrderLogUserConfirmation(
        store:Store,
        userId: string,
        userName: string,
        logText: string,
        actionType: "تحديث" | "إنشاء" | "حذف" | "شحن" | "إلغاء",
        order: StoreOrder
    ) {
        return HandlersFactory.create(this.logsUserConfirmationOrderModel, {
            userName,
            userConfirmation: userId,
            logText,
            actionType,
            store:store._id as string,
            storeName:store.storeSubDomain as string,
            orderTracking: order.orderTracking || "",
            clientLocation: order.clientLocation,
            clientPhoneNumber: order.clientPhoneNumber,
            clientTotalOrder: order.totalPrice,
            clientName: order.clientName,
            productName: order.productShortName,
        });
    }

    async findAllCalcsLogsUserConfirmation(queryParams: TQueryParams, payload: Partial<LogsUserConfirmationCacls>) {
        const apiFeatures = await apiFeaturesHelper(this.logsUserConfirmationCalcsModel, this.logsUserConfirmationCalcsModel, queryParams, {
            ...payload,
        });
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    async findAllOrdersLogsUserConfirmation(queryParams: TQueryParams, payload: Partial<LogsUserConfirmationOrder>) {
        const apiFeatures = await apiFeaturesHelper(this.logsUserConfirmationOrderModel, this.logsUserConfirmationOrderModel, queryParams, {
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
