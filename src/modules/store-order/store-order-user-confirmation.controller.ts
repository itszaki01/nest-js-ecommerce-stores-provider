import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe, UnauthorizedException, UseGuards, Delete } from "@nestjs/common";
import { UpdateStoreOrderDto } from "./dto/update-store-order.dto";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { SafirClickService } from "src/api/safir-click/safir-click.service";
import { StoreService } from "../store/store.service";
import { ProColiService } from "src/api/pro-coli/pro-coli.service";
import { AuthUserConfirmationGuard } from "../auth-user-confirmation/guards/auth-confirmation-user.guard";
import { ConfirmationUser } from "../auth-user-confirmation/decorators/confirmation-user.decorator";
import { UserConfirmation } from "../user-confirmation/schema/user-confirmation.schema";
import { UserConfirmationService } from "../user-confirmation/user-confirmation.service";
import { LogsUserConfirmationService } from "../logs-user-confirmation/logs-user-confirmation.service";
import { StoreOrderService } from "./store-order.service";
import { UserCompanyAuth } from "../auth-company-user/decorator/user-company-auth.decorator";
import { CompanyService } from "../company/company.service";
import { SkipThrottle } from "@nestjs/throttler";
import { InjectModel } from "@nestjs/mongoose";
import { StoreOrder } from "./schema/store-order.schema";
import { Model } from "mongoose";
import { TShippedOrder } from "./store-order.controller";

@SkipThrottle()
@Controller("store-order-user-confirmation")
export class StoreOrderUserConfirmationController {
    constructor(
        @InjectModel(StoreOrder.name) private storeOrderModel: Model<StoreOrder>,
        // @InjectModel(Store.name) private storeModel: Model<Store>,
        private readonly storeOrderService: StoreOrderService,
        private readonly safirClickService: SafirClickService,
        private readonly storeServcie: StoreService,
        private readonly proColiService: ProColiService,
        private readonly logsUserConfirmationService: LogsUserConfirmationService,
        private readonly userConfirmationService: UserConfirmationService,
        private readonly companyService: CompanyService
    ) {}

    // @Post()
    // create(@Body() createStoreOrderDto: CreateStoreOrderDto, @StoreUser("storeId") storeId: string) {
    //     return this.storeOrderService.create(createStoreOrderDto, storeId);
    // }

    @UseGuards(AuthUserConfirmationGuard)
    @Get()
    findAll(@ConfirmationUser() userConfirmation: Readonly<UserConfirmation>, @Query() queryParams: TQueryParams & { orderStatus?: string }) {
        return this.storeOrderService.findAll(userConfirmation, queryParams);
    }

    @UserCompanyAuth("CompanyOwner", "CopmanyAccountant")
    @Get("unpaind-members-orders/:userConfirmationId")
    findAllUnpaidMembersOrders(@Param("userConfirmationId", ParseMongoIdPipe) userConfirmationId: string, @Query() queryParams: TQueryParams) {
        return this.storeOrderService.findAllUnpaidMembersOrders(userConfirmationId, queryParams);
    }

    @UseGuards(AuthUserConfirmationGuard)
    @Get("status")
    findAllStatus(@ConfirmationUser() userConfirmation: Readonly<UserConfirmation>) {
        return this.storeOrderService.findAllStatus(userConfirmation);
    }

    @UseGuards(AuthUserConfirmationGuard)
    @Post("ship-the-order/:orderId")
    async shipTheOrder(@Param("orderId", ParseUUIDPipe) orderId: string, @ConfirmationUser() userConfirmation: Readonly<UserConfirmation>) {
        //0: Get Company
        const companyData = await this.companyService.findeOne();

        //1: Get Order Data
        const orderData = await this.storeOrderService.findOneByUUId(orderId);

        //2: Get Store Settings
        const storeData = await this.storeServcie.findOne(orderData.store);

        //2: check if store subscribe to confirmation Service
        if (!storeData.allowConfirmationService) {
            throw new UnauthorizedException("لايمكنك شحن الطلب لأن المتجر غير مشترك في خدمة تأكيد الطلبيات");
        }

        //2.2 if order is already shipped return order is already shipped
        if (orderData.isInDelivery) {
            return { message: "Order Already Shipped" };
        }

        // //3: Send Data To Shipping Service Api
        // if (EnviromentsClass.COMPNAY_ECO_SYSTEM === "safir-click") {
        //     const shippedOrder = await this.safirClickService.shipTheOrder(orderData, storeData);

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
        }
        //1: Update The Order Commession and set to inDelevry and finish its cycle
        const updatedOrder = await this.storeOrderService.updateOneByPayload(orderData.orderUID as string, {
            isInDelivery: true,
            orderTracking: String(shippedOrder.orderId),
            orderStatus: "قيد التوصيل",
            confirmedAndShippedBy: "CompanyService",
        });

        //1.1 if order is from cart update all the cart status
        if (updatedOrder.isFromCart) {
            await this.storeOrderService.updateCartOrders(updatedOrder.cartUID, { orderStatus: "قيد التوصيل", isInDelivery: true });
        }

        if (companyData.storeServiceCaclsType === "OrderConfirmed") {
            updatedOrder.orderCommesion = shippedOrder.orderCommesion;
            updatedOrder.isFinishedStoreCalcsCycle = true;
        }

        //2: Increase Store Service Fees
        if (companyData.storeServiceCaclsType === "OrderConfirmed") {
            storeData.$inc("totalUnpaidFees", Number(shippedOrder.orderCommesion));
            storeData.$inc("totalUnpaidOrders", 1);
        }

        //3.1: increase confirmation Service Fees
        if (companyData.confirmationServiceCalcsType === "OrderConfirmed") {
            storeData.$inc(
                "totalConfirmationServiceFees",
                Number(companyData.afflitaConfirmationFee + companyData.companyConfirmationFee + companyData.memberConfirmationFee)
            );
            storeData.$inc("totalConfirmationServiceConfirmedOrders", 1);
        } else if (companyData.confirmationServiceCalcsType === "AdvencedOrderCalcs") {
            storeData.$inc(
                "totalConfirmationServiceFees",
                Number(companyData.afflitaConfirmationFee + companyData.companyConfirmationFee + companyData.memberConfirmationFee)
            );
            storeData.$inc("totalConfirmationServiceConfirmedOrders", 0.5);
        }

        storeData.lastShippedOrderDate = new Date(Date.now());
        await storeData.save();

        //3: If user Role is Call Member Update the profit
        if (userConfirmation.role == "UserConfirmation") {
            if (companyData.confirmationServiceCalcsType === "OrderConfirmed") {
                if (userConfirmation.allowMonthlyPayment) {
                    const userCallMember = await this.userConfirmationService.findOne(userConfirmation._id as string);
                    userCallMember.$inc("totalConfirmedOrders", 1);
                    await userCallMember.save();
                    updatedOrder.isFinishedConfirmationServiceCalcsCycle = true;
                } else {
                    const userCallMember = await this.userConfirmationService.findOne(userConfirmation._id as string);
                    userCallMember.$inc("totalConfirmedOrders", 1);
                    userCallMember.$inc("totalProfit", Number(companyData.memberConfirmationFee) || 0);
                    updatedOrder.isFinishedConfirmationServiceCalcsCycle = true;
                    await userCallMember.save();
                }
            } else if (companyData.confirmationServiceCalcsType === "AdvencedOrderCalcs") {
                if (userConfirmation.allowMonthlyPayment) {
                    const userCallMember = await this.userConfirmationService.findOne(userConfirmation._id as string);
                    userCallMember.$inc("totalConfirmedOrders", 0.5);
                    await userCallMember.save();
                } else {
                    const userCallMember = await this.userConfirmationService.findOne(userConfirmation._id as string);
                    userCallMember.$inc("totalConfirmedOrders", 0.5);
                    userCallMember.$inc("totalProfit", Number(companyData.memberConfirmationFee) || 0);
                    await userCallMember.save();
                }
            }
        }

        await updatedOrder.save();
        //4:Log The Action
        await this.logsUserConfirmationService.createOrderLogUserConfirmation(
            storeData,
            userConfirmation._id as string,
            userConfirmation.userName,
            `تم شحن وتأكيد الطلب بواسطة ${userConfirmation.userName}`,
            "شحن",
            updatedOrder
        );

        return { orderId: shippedOrder.orderId, orderCommesion: updatedOrder.orderCommesion };
    }

    @UseGuards(AuthUserConfirmationGuard)
    @Get(":orderId")
    findOne(@Param("orderId", ParseUUIDPipe) orderId: string) {
        return this.storeOrderService.findOneByUUId(orderId);
    }

    @UseGuards(AuthUserConfirmationGuard)
    @Patch(":orderId")
    async update(
        @Param("orderId", ParseUUIDPipe) orderId: string,
        @ConfirmationUser() userConfirmation: Readonly<UserConfirmation>,
        @Body() updateStoreOrderDto: UpdateStoreOrderDto
    ) {
        //1: Get Order Data
        const orderData = await this.storeOrderService.findOneByUUId(orderId);

        //2: Get Store Settings
        const storeData = await this.storeServcie.findOne(orderData.store);

        //2: check if store subscribe to confirmation Service
        if (!storeData.allowConfirmationService) {
            throw new UnauthorizedException("لايمكنك تحديث الطلب لأن المتجر غير مشترك في خدمة تأكيد الطلبيات");
        }

        //2: Update
        const updatedOrder = await this.storeOrderService.updateOneByPayload(orderId, updateStoreOrderDto);

        //3: Log the Actions i subscreption is pro
        if (orderData.orderStatus != updatedOrder.orderStatus) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير حالة الطلب من ${orderData.orderStatus} إلى ===> ${updatedOrder.orderStatus} بواسطة ${userConfirmation.userName}`,
                updatedOrder.orderStatus === "ملغي" ? "إلغاء" : "تحديث",
                orderData
            );
        }

        if (orderData.totalPrice != updatedOrder.totalPrice) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير مجموع الطلب من ${orderData.totalPrice} إلى ===> ${updatedOrder.totalPrice} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        if (orderData.clientLocation != updatedOrder.clientLocation) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير منطقة الطلب من ${orderData.clientLocation} إلى ===> ${updatedOrder.clientLocation} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        if (orderData.clientPhoneNumber != updatedOrder.clientPhoneNumber) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير رقم هاتف الزبون الطلب من ${orderData.clientPhoneNumber} إلى ===> ${updatedOrder.clientPhoneNumber} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        if (orderData.quantity != updatedOrder.quantity) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير كمية الطلب من ${orderData.quantity} إلى ===> ${updatedOrder.quantity} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        if (orderData.properties != updatedOrder.properties) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير خيارات الطلب من ${orderData.properties} إلى ===> ${updatedOrder.properties} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        if (orderData.shippingType != updatedOrder.shippingType) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير نوع توصيل الطلب من ${orderData.shippingType} إلى ===> ${updatedOrder.shippingType} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        if (orderData.fakeShippingPrice != updatedOrder.fakeShippingPrice) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير سعر توصيل الطلب من ${orderData.fakeShippingPrice} إلى ===> ${updatedOrder.fakeShippingPrice} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        if (orderData.note != updatedOrder.note) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير ملاحظة الطلب من ${orderData.note || "/"} إلى ===> ${updatedOrder.note} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        if (orderData.clientAddress != updatedOrder.clientAddress) {
            await this.logsUserConfirmationService.createOrderLogUserConfirmation(
                storeData,
                userConfirmation._id as string,
                userConfirmation.userName,
                `تم تغيير عنوان الطلب من ${orderData.clientAddress} إلى ===> ${updatedOrder.clientAddress} بواسطة ${userConfirmation.userName}`,
                "تحديث",
                orderData
            );
        }

        return updatedOrder;
    }

    @UseGuards(AuthUserConfirmationGuard)
    @Delete(":orderId")
    async remove(@Param("orderId", ParseUUIDPipe) orderId: string, @ConfirmationUser() userConfirmation: Readonly<UserConfirmation>) {
        //1: Get Order Data
        const orderData = await this.storeOrderService.findOneByUUId(orderId);

        //2: Get Store Settings
        const storeData = await this.storeServcie.findOne(orderData.store);

        const deletedOrder = await this.storeOrderService.removeOneByPayload(orderId, storeData.id as string);

        await this.logsUserConfirmationService.createOrderLogUserConfirmation(
            storeData,
            userConfirmation._id as string,
            userConfirmation.userName,
            `تم حذف الطلب بواسطة ${userConfirmation.userName}`,
            "حذف",
            deletedOrder
        );
        return deletedOrder;
    }
}
