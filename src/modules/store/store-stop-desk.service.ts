import { Injectable, NotFoundException } from "@nestjs/common";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { Store } from "./schema/store.schema";
import { Model } from "mongoose";
import { StoreOrder } from "../store-order/schema/store-order.schema";
import axios from "axios";
import { CompanyService } from "../company/company.service";
import { StoreDomainService } from "../store-domain/store-domain.service";
import { StoreDomain } from "../store-domain/schema/store-domain.schema";

@Injectable()
export class StoreStopDeskService {
    constructor(
        @InjectModel(Store.name) private storeModel: Model<Store>,
        @InjectModel(StoreOrder.name) private storeOrderModel: Model<StoreOrder>,
        private readonly companyService: CompanyService,
        private readonly storeDomainService: StoreDomainService
    ) {}

    async clearStoreCalcs(storeId: string) {
        //1: Get Store & reset totalOrders && totalOrdersFees => 0
        const store = await this.storeModel.findByIdAndUpdate(storeId, {
            totalUnpaidFees: 0,
            totalUnpaidOrders: 0,
            totalConfirmationServiceConfirmedOrders: 0,
            totalConfirmationServiceFees: 0,
            isMonthlySubscreptionPaid: true,
        });
        if (!store) {
            throw new NotFoundException("لم يتم العثور على المتجر");
        }

        //2: Update All Store Orders To isPaidFeed => true
        await this.storeOrderModel.updateMany({ store: storeId, isFeesPaid: false, isInDelivery: true }, { isFeesPaid: true });

        //3: check if store Subscreptio is Expired Increate it
        if (store.subScriptionExpireAfterDays === 0) {
            store.$inc("subScriptionExpireAfterDays", 31);
            await store.save();
        }

        return store;
    }

    async unActivateStore(storeId: string) {
        const store = await HandlersFactory.findOne(this.storeModel, storeId);
        const company = await this.companyService.findeOne();

        if (store.isActive) {
            //1: Remove All Files And Images
            axios.delete(`${company.companyCdnUrl}/removeStore/${storeId}`, {
                headers: {
                    "X-AFFLITA-SUDO-PASS": "!#$#@#$%@#DSFDSFSf6sd4f67s98df7#@#",
                },
            });

            //2: Get All Store Domains And Remove Them
            const storeDomains = await this.storeDomainService.findAll(storeId, {});
            storeDomains.documents.map(async (domain: StoreDomain) => this.storeDomainService.removeOneByPayload(domain._id as string, storeId));

            //4: Set Store UnActive
            store.isActive = false;
            await store.save();
        } else {
            //activate store
            store.isActive = true;
            await store.save();
        }

        return store;
    }
}
