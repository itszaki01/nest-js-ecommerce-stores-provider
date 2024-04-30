import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe, UnauthorizedException, Delete } from "@nestjs/common";
import { StoreOrderService } from "./store-order.service";
import { UpdateStoreOrderDto } from "./dto/update-store-order.dto";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { TQueryParams } from "src/@types/QueryParams.type";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { SafirClickService } from "src/api/safir-click/safir-click.service";
import { StoreService } from "../store/store.service";
import { ProColiService } from "src/api/pro-coli/pro-coli.service";
import { UserStore } from "../user-store/schema/user-store.schema";
import { LogsUserStoreService } from "../logs-user-store/logs-user-store.service";
import { UserStoreService } from "../user-store/user-store.service";
import { StoreObject } from "../store/decorator/store-objcet.decorator";
import { Store } from "../store/schema/store.schema";
import { CompanyService } from "../company/company.service";
import { SkipThrottle } from "@nestjs/throttler";
import { Model } from "mongoose";
import { StoreOrder } from "./schema/store-order.schema";
import { InjectModel } from "@nestjs/mongoose";
import { EcoTrackService } from "src/api/eco-track/eco-track.service";

export type TShippedOrder = {
    orderId: string;
    orderCommesion: number;
};

@UserStoreAuth("StoreAdmin", "StoreCallMember")
@Controller("store-order")
export class StoreOrderController {
    constructor(
        @InjectModel(StoreOrder.name) private storeOrderModel: Model<StoreOrder>,
        // @InjectModel(Store.name) private storeModel: Model<Store>,
        private readonly storeOrderService: StoreOrderService,
        private readonly safirClickService: SafirClickService,
        private readonly storeServcie: StoreService,
        private readonly proColiService: ProColiService,
        private readonly ecoTrackService: EcoTrackService,
        private readonly logsUserStoreService: LogsUserStoreService,
        private readonly userStoreServcie: UserStoreService,
        private readonly companyService: CompanyService
    ) {}

    // @Post()
    // create(@Body() createStoreOrderDto: CreateStoreOrderDto, @StoreUser("storeId") storeId: string) {
    //     return this.storeOrderService.create(createStoreOrderDto, storeId);
    // }

    @Get()
    findAll(@StoreUser() userStore: Readonly<UserStore>, @Query() queryParams: TQueryParams & { orderStatus?: string }) {
        return this.storeOrderService.findAll(userStore, queryParams);
    }

    @UserStoreAuth("StoreAdmin", "StoreAccountent")
    @Get("unpaind-members-orders/:userStoreId")
    findAllUnpaidMembersOrders(
        @Param("userStoreId", ParseMongoIdPipe) userStoreId: string,
        @Query() queryParams: TQueryParams,
        @StoreObject() store: Readonly<Store>
    ) {
        return this.storeOrderService.findAllUnpaidMembersOrders(userStoreId, queryParams, store);
    }

    @Get("status")
    findAllStatus(@StoreUser() userStore: Readonly<UserStore>) {
        return this.storeOrderService.findAllStatus(userStore);
    }

    @SkipThrottle()
    @Post("ship-the-order/:orderId")
    async shipTheOrder(
        @Param("orderId", ParseUUIDPipe) orderId: string,
        @StoreObject() store: Readonly<Store>,
        @StoreUser() userStore: Readonly<UserStore>
    ) {
        //0: check if store subscribe to confirmation Service
        if (store.allowConfirmationService) {
            throw new UnauthorizedException("لايمكنك شحن الطلب لأنك مشترك في خدمة تأكيد الطلبيات");
        }

        //0.5 Get company
        const company = await this.companyService.findeOne();

        //1: Get Store Settings
        const storeData = await this.storeServcie.findOne(userStore.store);

        //2: Get Order Data
        const orderData = await this.storeOrderService.findOneByPayload(orderId, userStore.store);

        //2.1First check if user role is callmember check if the order is belong him
        if (userStore.role === "StoreCallMember" && orderData.assignToStoreCallMember != userStore._id) {
            throw new UnauthorizedException("ليس لديك الصلاحيات لشحن هذاالطلب");
        }

        //2.2 if order is already shipped return order is already shipped
        if (orderData.isInDelivery) {
            return { message: "Order Already Shipped" };
        }

        // //3: Send Data To Shipping Service Api
        // if (EnviromentsClass.COMPNAY_ECO_SYSTEM === "safir-click") {
        //      shippedOrder = await this.safirClickService.shipTheOrder(orderData, storeData);

        //     //Update The Order Commession and set to inDelevry
        //     orderData.isInDelivery = true;
        //     orderData.orderCommesion = shippedOrder.orderCommesion;
        //     orderData.orderTracking = String(shippedOrder.orderId.order_id);
        //     orderData.orderStatus = "قيد التوصيل";
        //     storeData.lastShippedOrderDate = new Date(Date.now());
        //     await storeData.save();
        //     await orderData.save();
        //     return shippedOrder;
        // } else

        let shippedOrder: TShippedOrder = { orderCommesion: 0, orderId: "TRACKING" };

        if (EnviromentsClass.COMPNAY_ECO_SYSTEM === "pro-coli") {
            shippedOrder = await this.proColiService.shipTheOrder(orderData, storeData);
        } else if (EnviromentsClass.COMPNAY_ECO_SYSTEM === "eco-track") {
            shippedOrder = await this.ecoTrackService.shipTheOrder(orderData, storeData);
        }

        //1: Update The Order Commession and set to inDelevry
        const updatedOrder = await this.storeOrderService.updateOneByPayload(orderData.orderUID as string, {
            isInDelivery: true,
            orderTracking: String(shippedOrder.orderId),
            orderStatus: "قيد التوصيل",
            confirmedAndShippedBy: "StoreService",
        });

        //1.1 if order is from cart update all the cart status
        if (updatedOrder.isFromCart) {
            await this.storeOrderService.updateCartOrders(updatedOrder.cartUID, { orderStatus: "قيد التوصيل", isInDelivery: true });
        }

        if (company.storeServiceCaclsType === "OrderConfirmed") {
            updatedOrder.orderCommesion = shippedOrder.orderCommesion;
            updatedOrder.isFinishedStoreCalcsCycle = true;
        }

        //2: Increase Store Service Fees If storeCalcsType === OrderConfirmed
        if (company.storeServiceCaclsType === "OrderConfirmed") {
            storeData.$inc("totalUnpaidFees", Number(shippedOrder.orderCommesion));
            storeData.$inc("totalUnpaidOrders", 1);
            storeData.lastShippedOrderDate = new Date(Date.now());
            await storeData.save();
        }

        //3: If user Role is Call Member Update the profit if ServiceConfirmation Calcs Type === 'OrderConfirmed'
        if (userStore.role == "StoreCallMember") {
            if (storeData.confirmationServiceCalcsType === "OrderConfirmed" || !company.allowOrdersAutoTracking) {
                const userCallMember = await this.userStoreServcie.findOne(userStore._id as string);
                userCallMember.$inc("totalOrders", 1);
                userCallMember.$inc("totalProfit", Number(storeData.shippedOrderConfirmationMemberFee) || 0);
                updatedOrder.isFinishedConfirmationServiceCalcsCycle = true;
                await userCallMember.save();
            }
        }
        await updatedOrder.save();

        //4:Log The Action
        if (storeData.storeSubcreption === "pro") {
            await this.logsUserStoreService.createOrderLogUserStore(
                userStore.store,
                userStore._id as string,
                userStore.userName,
                `تم شحن وتأكيد الطلب بواسطة ${userStore.userName}`,
                "شحن",
                updatedOrder
            );
        }

        return { orderId: shippedOrder.orderId, orderCommesion: updatedOrder.orderCommesion };
    }

    @Get(":orderId")
    findOne(@Param("orderId", ParseUUIDPipe) orderId: string, @StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeOrderService.findOneByPayload(orderId, storeId);
    }

    @Patch(":orderId")
    async update(
        @Param("orderId", ParseUUIDPipe) orderId: string,
        @StoreUser() userStore: Readonly<UserStore>,
        @StoreObject() store: Readonly<Store>,
        @Body() updateStoreOrderDto: UpdateStoreOrderDto
    ) {
        //0: check if store subscribe to confirmation Service
        if (store.allowConfirmationService) {
            throw new UnauthorizedException("لايمكنك تعديل الطلب لأنك مشترك في خدمة تأكيد الطلبيات");
        }

        //1: Get Order Befor Update
        const orderData = await this.storeOrderService.findOneByPayload(orderId, userStore.store);

        //2: Update
        const updatedOrder = await this.storeOrderService.updateOneByPayload(orderId, updateStoreOrderDto);

        //3: Log the Actions i subscreption is pro
        if (store.storeSubcreption === "pro") {
            if (orderData.orderStatus != updatedOrder.orderStatus) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير حالة الطلب من ${orderData.orderStatus} إلى ===> ${updatedOrder.orderStatus} بواسطة ${userStore.userName}`,
                    updatedOrder.orderStatus === "ملغي" ? "إلغاء" : "تحديث",
                    orderData
                );
            }

            if (orderData.totalPrice != updatedOrder.totalPrice) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير مجموع الطلب من ${orderData.totalPrice} إلى ===> ${updatedOrder.totalPrice} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }

            if (orderData.clientLocation != updatedOrder.clientLocation) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير منطقة الطلب من ${orderData.clientLocation} إلى ===> ${updatedOrder.clientLocation} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }

            if (orderData.clientPhoneNumber != updatedOrder.clientPhoneNumber) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير رقم هاتف الزبون الطلب من ${orderData.clientPhoneNumber} إلى ===> ${updatedOrder.clientPhoneNumber} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }

            if (orderData.quantity != updatedOrder.quantity) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير كمية الطلب من ${orderData.quantity} إلى ===> ${updatedOrder.quantity} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }

            if (orderData.properties != updatedOrder.properties) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير خيارات الطلب من ${orderData.properties} إلى ===> ${updatedOrder.properties} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }

            if (orderData.shippingType != updatedOrder.shippingType) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير نوع توصيل الطلب من ${orderData.shippingType} إلى ===> ${updatedOrder.shippingType} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }

            if (orderData.fakeShippingPrice != updatedOrder.fakeShippingPrice) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير سعر توصيل الطلب من ${orderData.fakeShippingPrice} إلى ===> ${updatedOrder.fakeShippingPrice} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }

            if (orderData.note != updatedOrder.note) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير ملاحظة الطلب من ${orderData.note || "/"} إلى ===> ${updatedOrder.note} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }

            if (orderData.clientAddress != updatedOrder.clientAddress) {
                await this.logsUserStoreService.createOrderLogUserStore(
                    userStore.store,
                    userStore._id as string,
                    userStore.userName,
                    `تم تغيير عنوان الطلب من ${orderData.clientAddress} إلى ===> ${updatedOrder.clientAddress} بواسطة ${userStore.userName}`,
                    "تحديث",
                    orderData
                );
            }
        }

        return updatedOrder;
    }

    @UserStoreAuth("StoreAdmin", "StoreCallMember")
    @Delete(":orderId")
    async remove(
        @Param("orderId", ParseUUIDPipe) orderId: string,
        @StoreObject() store: Readonly<Store>,
        @StoreUser() userStore: Readonly<UserStore>
    ) {
        //1: check if store subscribe to confirmation Service
        if (store.allowConfirmationService) {
            throw new UnauthorizedException("لايمكنك حذف الطلب لأنك مشترك في خدمة تأكيد الطلبيات");
        }

        //2: Delete order
        const deletedOrder = await this.storeOrderService.removeOneByPayload(orderId, userStore.store);

        //3: Log the action
        await this.logsUserStoreService.createOrderLogUserStore(
            userStore.store,
            userStore._id as string,
            userStore.userName,
            `تم حذف الطلب بواسطة ${userStore.userName}`,
            "حذف",
            deletedOrder
        );
        return deletedOrder;
    }
}
