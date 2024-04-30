import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LogsUserStore } from "./schema/logs-user-store.schema";
import { HandlersFactory } from "src/utils/handlersFactory";
import { LogsUserStoreCacls } from "./schema/logs-user-store-calcs.schema";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import { LogsUserStoreOrder } from "./schema/logs-user-order.schema";
import { StoreOrder } from "../store-order/schema/store-order.schema";

@Injectable()
export class LogsUserStoreService {
    constructor(
        @InjectModel(LogsUserStore.name) private logsUserStoreModel: Model<LogsUserStore>,
        @InjectModel(LogsUserStoreCacls.name) private logsUserStoreCalcsModel: Model<LogsUserStoreCacls>,
        @InjectModel(LogsUserStoreOrder.name) private logsUserStoreOrderModel: Model<LogsUserStoreOrder>
    ) {}

    createLogUserStore(storeId: string, userId: string, userName: string, logText: string, actionType: "تحديث" | "إنشاء" | "حذف" | "إلغاء" | "تفعيل") {
        return HandlersFactory.create(this.logsUserStoreModel, {
            userName,
            userStore: userId,
            store: storeId,
            logText,
            actionType,
        });
    }

    createCalcsLogUserStore(storeId: string, userId: string, userName: string, logText: string, paymentAmount: number) {
        return HandlersFactory.create(this.logsUserStoreCalcsModel, {
            userName,
            userStore: userId,
            store: storeId,
            logText,
            paymentAmount,
        });
    }

    createOrderLogUserStore(
        storeId: string,
        userId: string,
        userName: string,
        logText: string,
        actionType: "تحديث" | "إنشاء" | "حذف" | "شحن" | "إلغاء",
        order: StoreOrder
    ) {
        return HandlersFactory.create(this.logsUserStoreOrderModel, {
            userName,
            userStore: userId,
            store: storeId,
            logText,
            actionType,
            orderTracking: order.orderTracking || "",
            clientLocation: order.clientLocation,
            clientPhoneNumber: order.clientPhoneNumber,
            clientTotalOrder: order.totalPrice,
            clientName: order.clientName,
            productName: order.productShortName,
        });
    }

    async findAllLogsUserStore(storeId: string, queryParams: TQueryParams, payload: Partial<LogsUserStore>) {
        const apiFeatures = await apiFeaturesHelper(this.logsUserStoreModel, this.logsUserStoreModel, queryParams, {
            store: storeId,
            ...payload,
        });
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    async findAllCalcsLogsUserStore(storeId: string, queryParams: TQueryParams, payload: Partial<LogsUserStoreCacls>) {
        const apiFeatures = await apiFeaturesHelper(this.logsUserStoreCalcsModel, this.logsUserStoreCalcsModel, queryParams, {
            store: storeId,
            ...payload,
        });
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    async findAllOrdersLogsUserStore(storeId: string, queryParams: TQueryParams, payload: Partial<LogsUserStoreOrder>) {
        const apiFeatures = await apiFeaturesHelper(this.logsUserStoreOrderModel, this.logsUserStoreOrderModel, queryParams, {
            store: storeId,
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
