import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, NotFoundException, BadRequestException, Put } from "@nestjs/common";
import { StoreService } from "./store.service";
import { CreateStoreDto } from "./dto/create-store.dto";
import { AuthStopDeskGuard } from "../auth-stop-desk-user/guards/auth-stop-desk-user.guard";
import { StopDeskUser } from "../auth-stop-desk-user/decorators/stop-desk-user.decorator";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { TQueryParams } from "src/@types/QueryParams.type";
import { UpdateStoreFromStopDeskDto } from "./dto/update-store-from-stop-desk.dto";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { UserStopDeskService } from "../user-stop-desk/user-stop-desk.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { InjectModel } from "@nestjs/mongoose";
import { UserStore } from "../user-store/schema/user-store.schema";
import { Model } from "mongoose";
import { Store } from "./schema/store.schema";
import { UserStoreService } from "../user-store/user-store.service";
import { StoreOrderService } from "../store-order/store-order.service";
import { LogsStopDeskService } from "../logs-stop-desk/logs-stop-desk.service";
import { StoreStopDeskService } from "./store-stop-desk.service";
import { UserStopDesk } from "../user-stop-desk/schema/user-stop-desk.schema";
import { CompanyService } from "../company/company.service";

@UseGuards(AuthStopDeskGuard)
@Controller("store/stop-desk-user")
export class StoreStopDeskController {
    constructor(
        private readonly storeService: StoreService,
        private readonly storeStopDeskService: StoreStopDeskService,
        private readonly twoFactoryService: TwoFactoryService,
        private readonly userStopDeskService: UserStopDeskService,
        private readonly userStoreService: UserStoreService,
        private readonly storeOrderService: StoreOrderService,
        private readonly logsStopDeskService: LogsStopDeskService,
        private readonly companyService: CompanyService,
        @InjectModel(UserStore.name) private userStoreModel: Model<UserStore>,
        @InjectModel(Store.name) private storeModel: Model<Store>
    ) {}

    @Post()
    async create(@Body() createStoreDto: CreateStoreDto, @StopDeskUser() stopDesk: Readonly<UserStopDesk>) {
        //2:Validate 2FA Code
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(stopDesk.twoFactorySecretCode, createStoreDto.twoFactoryLoginCode);
        }

        //3:Create Store
        const store = await this.storeService.create(createStoreDto, stopDesk._id as string, false);

        //4:Log The Action
        await this.logsStopDeskService.createStopDeskActionLog(
            stopDesk._id as string,
            store,
            `تم إنشاء المتجر ${createStoreDto.storeSubDomain} بنجاح`,
            "إنشاء"
        );

        return store;
    }

    @Post("reset-store-cals/:storeId")
    async clearStoreCalcs(
        @Param("storeId", ParseMongoIdPipe) storeId: string,
        @Query("twoFactoryCode") twoFactoryCode: string,
        @StopDeskUser("userId") stopDeskId: string
    ) {
        //1:Get StopDesk User
        const stopDesk = await this.userStopDeskService.findOne(stopDeskId);

        

        //2:Validate 2FA Code
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(stopDesk.twoFactorySecretCode, twoFactoryCode);
        }

        //3:Cleare Calcs
        //first Get Store Data befor clear
        const store = await this.storeService.findOne(storeId);
        if (store.totalUnpaidFees === 0 && store.isMonthlySubscreptionPaid) {
            throw new BadRequestException("حساب المتجر يساوي 0");
        }

        //3.5 Get Company monthly Fees
        const { monthlySubScreptionFees, allowMonthlySubscription } = await this.companyService.findeOne();
        const monthlyFees = store.isMonthlySubscreptionPaid || !allowMonthlySubscription
            ? 0
            : store.storeSubcreption === "pro"
              ? monthlySubScreptionFees.proSubscriptionFee + monthlySubScreptionFees.proSubscriptionFeeAfflita
              : monthlySubScreptionFees.basicSubscriptionFee + monthlySubScreptionFees.basicSubscriptionFeeAfflita;

        //4:Update Desk UnPaid Amount and stores
        stopDesk.$inc("totalUnPaidStoresNumber", 1);
        stopDesk.$inc("totalUnPaidStoresPayments", Number(store.totalUnpaidFees + store.totalConfirmationServiceFees + monthlyFees));
        await stopDesk.save();

        //clear calcs
        await this.storeStopDeskService.clearStoreCalcs(storeId);

        //5:Log The Action
        if (store.totalUnpaidFees > 0) {
            await this.logsStopDeskService.createStopDeskClearCalcsLog(
                stopDeskId,
                store,
                `تم تصفية حساب المتجر ${store.storeSubDomain} من ${store.totalUnpaidFees} دج و ${store.totalUnpaidOrders} طلب إلى === > 0 دج و 0 طلب`,
                store.totalUnpaidFees,
                "خدمة المتجر الإلكتروني"
            );
        }

        if (store.totalConfirmationServiceFees > 1) {
            await this.logsStopDeskService.createStopDeskClearCalcsLog(
                stopDeskId,
                store,
                `تم تصفية حساب تكلفة خدمة تأكيد الطلبات للمتجر ${store.storeSubDomain} من ${store.totalConfirmationServiceFees} دج و ${store.totalConfirmationServiceConfirmedOrders} طلب مأكد إلى ===> 0 دج و 0 طلب مأكد`,
                store.totalConfirmationServiceFees,
                "خدمة تأكيد الطلبات"
            );
        }

        if (!store.isMonthlySubscreptionPaid) {
           
            if (allowMonthlySubscription)
                await this.logsStopDeskService.createStopDeskClearCalcsLog(
                    stopDeskId,
                    store,
                    `تم دفع الإشتراك الشهري للمتجر ${store.storeSubDomain} المقدر ب ${monthlyFees} دج`,
                    monthlyFees,
                    "الإشتراك الشهري للمتجر"
                );
        }

        return { message: "success" };
    }

    @Get()
    async findAll(
        @Query() queryParams: TQueryParams,
        @Query("email") email: string,
        @Query("phone") phone: string,
        @Query("storeName") storeName: string,
        @StopDeskUser("userId") stopDeskUserId: string
    ) {
        //1:Get Store Owner
        if (queryParams.searchMethod === "ByClientEmail" && email) {
            const user = await this.userStoreModel.findOne({ email });
            if (!user) {
                throw new NotFoundException("لم يتم العثور على المتاجر");
            }
            return this.storeService.findAllByPayload(queryParams, { storeOwner: user._id.toString(), isSubStore: false });
        } else if (queryParams.searchMethod === "ByPhoneNumber" && phone) {
            const users = await this.userStoreModel.find({ userPhoneNumber: new RegExp(`^${phone}`) });
            if (users.length === 0) {
                throw new NotFoundException("لم يتم العثور على المتاجر");
            }
            const stores = users.map(async (user) => {
                return await this.storeService.findAllByPayload(queryParams, { storeOwner: user._id.toString(), isSubStore: false });
            });

            const storesS = await Promise.all(stores);
            const finalResults = storesS.map((storeData) => storeData.documents[0]);

            return {
                results: finalResults.length,
                documents: finalResults,
            };
        } else if (queryParams.searchMethod === "ByClientStoreName" && storeName) {
            const stores = await this.storeModel.find({ storeSubDomain: new RegExp(`^${storeName}`), isSubStore: false });

            return {
                results: stores.length,
                documents: stores,
            };
        } else {
            return this.storeService.findAllByPayload(queryParams, { createdByStopDesk: stopDeskUserId, isSubStore: false });
        }
    }

    @Get("get-store-by-email")
    async getStoreByEmail(@Query("email") email: string) {
        //1:Get UserID
        const user = await this.userStoreService.findOneByPayload({ email }, "لم يتم العثور على المتجر");

        //2:Get Store By userId
        return this.storeService.findOne(user.store);
    }

    @Get("get-store-by-domain-name")
    async getStoresByPhone(@Query("storeName") storeName: string) {
        //1:Get UserID
        return await this.storeService.findOneByPayload({ storeSubDomain: storeName });
    }
    @Get("get-all-unpaid-store-orders/:storeId")
    async getAllUnPaidStoreOrders(@Param("storeId") storeId: string, @Query() queryParams: TQueryParams) {
        return await this.storeOrderService.findAllUnPaidFeesOrders(storeId, queryParams);
    }

    @Get(":storeId")
    findOne(@Param("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeService.findOne(storeId);
    }

    @Patch(":storeId")
    async updateFromStopDesk(
        @Param("storeId", ParseMongoIdPipe) storeId: string,
        @Body() updateStoreFromStopDeskDto: UpdateStoreFromStopDeskDto,
        @StopDeskUser() stopDesk: Readonly<UserStopDesk>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
        //2:Validate 2FA Code
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(stopDesk.twoFactorySecretCode, twoFactoryCode);
        }

        //3:Get Data Before Change
        const store = await this.storeService.findOne(storeId);

        //4: Update
        const updatedStore = await this.storeService.updateFromStopDesk(storeId, updateStoreFromStopDeskDto);

        //5:Log The Action
        if (updatedStore.storeSubcreption != store.storeSubcreption) {
            await this.logsStopDeskService.createStopDeskActionLog(
                stopDesk._id as string,
                store,
                `تم تغيير نوع إشتراك المتجر ${store.storeSubDomain} من ${store.storeSubcreption} إلى ${updatedStore.storeSubcreption} بنجاح`,
                "تحديث"
            );
        } else {
            await this.logsStopDeskService.createStopDeskActionLog(
                stopDesk._id as string,
                updatedStore,
                `تم تحديث المتجر ${store.storeSubDomain} بنجاح`,
                "تحديث"
            );
        }
        return store;
    }

    @Put(":storeId")
    async unActivateStore(
        @Param("storeId", ParseMongoIdPipe) storeId: string,
        @Query("twoFactoryCode") twoFactoryCode: string,
        @StopDeskUser() stopDesk: Readonly<UserStopDesk>
    ) {
        //2:Validate 2FA Code
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(stopDesk.twoFactorySecretCode, twoFactoryCode);
        }
        const updatedStore = await this.storeStopDeskService.unActivateStore(storeId);
        if (updatedStore.isActive) {
            await this.logsStopDeskService.createStopDeskActionLog(
                stopDesk._id as string,
                updatedStore,
                `تم تنشيط المتجر ${updatedStore.storeSubDomain} بنجاح`,
                "تفعيل"
            );
        } else {
            await this.logsStopDeskService.createStopDeskActionLog(
                stopDesk._id as string,
                updatedStore,
                `تم إلغاء تنشيط المتجر ${updatedStore.storeSubDomain} بنجاح`,
                "إلغاء"
            );
        }

        return updatedStore;
    }
}
