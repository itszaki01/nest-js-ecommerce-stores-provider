import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import axios from "axios";
import { StoreOrder } from "src/modules/store-order/schema/store-order.schema";
import { Store } from "src/modules/store/schema/store.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StoreService } from "src/modules/store/store.service";
import { StoreOrderService } from "src/modules/store-order/store-order.service";
import { promiseWait } from "src/helpers/promiseWait";
import { CompanyService } from "src/modules/company/company.service";
import { UserStore } from "src/modules/user-store/schema/user-store.schema";
import { UserConfirmation } from "src/modules/user-confirmation/schema/user-confirmation.schema";
import { LogsUserStoreService } from "src/modules/logs-user-store/logs-user-store.service";
import * as https from "https";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { StoreProduct } from "src/modules/store-product/schema/store-product.schema";
import { StoreLocationService } from "src/modules/store-location/store-location.service";
import { IEcoTrackRES, IEcoTrackTrackingRES } from "../interfaces/EcoTrack.types";
import { algeriaCities } from "src/constants/algeria_cities";

const axios6sTO = axios.create({
    timeout: 6000,
});

@Injectable()
export class EcoTrackService {
    constructor(
        @InjectModel(StoreOrder.name) private storeOrderModel: Model<StoreOrder>,
        @InjectModel(UserStore.name) private userStoreModel: Model<UserStore>,
        @InjectModel(StoreProduct.name) private storeProductModel: Model<StoreProduct>,
        @InjectModel(UserConfirmation.name) private userConfirmationModel: Model<UserConfirmation>,
        private readonly storeLocationService: StoreLocationService,
        private readonly storeOrderService: StoreOrderService,
        private readonly storeService: StoreService,
        private readonly companyService: CompanyService,
        private readonly logsUserStoreService: LogsUserStoreService
    ) {}

    async shipTheOrder(orderData: StoreOrder, storeData: Store) {
        //Get Company
        const company = await this.companyService.findeOne();

        //0: If order from cart get all products sku
        let productsSkus: string[] = [];
        if (orderData.isFromCart && orderData.isCartMainOrder) {
            productsSkus = (await this.storeOrderModel.find({ cartUID: orderData.cartUID })).map(
                (order) => `${order.productSku} (${order.quantity}) `
            );
        }

        //1:Get Shipping Location Index
        const orderDataLocationIndex = await this.storeLocationService.findOneByPayload(orderData.locationId, orderData.store);

        //2: Get Fr commune
        const commune = algeriaCities.find(
            (locationData) =>
                locationData.commune_name === orderData.clientAddress && Number(locationData.wilaya_code) === orderDataLocationIndex.locationIndex
        );
        if (!commune) {
            throw new NotFoundException("إسم البلدية غير صحيح");
        }
        console.log(commune.commune_name_ascii)

        //3:Generate The Query
        const orderdProducts = productsSkus.length >= 2 ? productsSkus.join(",") : `${orderData.productSku} (${orderData.quantity})`;
        const orderQuery = `
        api_token=${storeData.apiKey1}&nom_client=${orderData.clientName}
        &telephone=${orderData.clientPhoneNumber}&adresse=${orderData.clientAddress}&commune=${commune.commune_name_ascii}&
        code_wilaya=${orderDataLocationIndex.locationIndex}&montant=${orderData.totalPrice}&remarque=${orderData.note || ""}&produit=${orderdProducts}&
        quantite=${productsSkus.length}&boutique=${storeData.storeSubDomain}&type=${1}&stop_desk=${orderData.shippingType === "للمكتب" ? 1 : 0}`;

        try {
            const order: IEcoTrackRES = (await axios.post(`${EnviromentsClass.ECOTACK_API_LINK_COMPANY}/api/v1/create/order?${orderQuery}`)).data;

            //decrase the product quentity
            if (orderData.isFromCart) {
                //1:Get all order
                const orders = await this.storeOrderModel.find({ cartUID: orderData.cartUID });

                //2: Loop & decrease
                orders.map(async (order) => {
                    await this.storeProductModel.findByIdAndUpdate(order.productId, { $inc: { remainingQtty: -1 } });
                });
            } else {
                await this.storeProductModel.findByIdAndUpdate(orderData.productId, { $inc: { remainingQtty: -1 } });
            }

            const commesionPrecentage =
                storeData.storeSubcreption === "pro" ? company.storeServicePrecentageProFee : company.storeServicePrecentageFee;

            const commesion = Math.trunc(
                orderData.totalPrice > 2000 ? (orderData.totalPrice / 100) * commesionPrecentage : company.confirmedOrderMinFeePrice
            );

            return {
                orderId: order.tracking,
                orderCommesion: commesion,
            };
        } catch (error) {
            console.log(error.response.data);
            throw new BadRequestException("حدث خطأ أثناء طلب شحن المنتج");
        }
    }

    async verifyApi(accesKeys: { key: string; token: string }) {
        const key = accesKeys.key;
        const token = accesKeys.token;
        const headers = { key, token };
        try {
            const data = await axios.get<{ Statut: string }>(`${EnviromentsClass.ECOTACK_API_LINK_COMPANY}/api/v1/`, { headers });
            if (data.data.Statut != "Accès activé") {
                throw new UnauthorizedException("الرجاء التأكد من صحة بيانات API");
            }
            return { message: "success" };
        } catch (error) {
            throw new UnauthorizedException("هناك مشكلة في ربط API");
        }
    }

    async autoTrackingLoop() {
        const company = await this.companyService.findeOne();
        if (EnviromentsClass.NODE_ENV === "DEV")
            axios6sTO.defaults.httpsAgent = new https.Agent({
                rejectUnauthorized: false,
            });

        const ordersCheckers = async (): Promise<void> => {
            const inDelivryOrders = await this.storeOrderModel.find({
                isInDelivery: true,
                orderStatus: "قيد التوصيل",
                isShipped: false,
                isCartMainOrder: true,
            });

            if (inDelivryOrders.length >= 1) {
                for (let i = 0; i < inDelivryOrders.length; i++) {
                    //0: Order
                    const orderData = inDelivryOrders[i];

                    //1:Get Store API's
                    const storeData = await this.storeService.findOne(orderData.store);

                    //2:Tracking & Headers Keys
                    const trackingQuery = `api_token=${storeData.apiKey1}&tracking=${orderData.orderTracking}`;

                    //3:Get Order Status
                    try {
                        const trackedOrder: IEcoTrackTrackingRES = (
                            await axios6sTO.get(`${EnviromentsClass.ECOTACK_API_LINK_COMPANY}/api/v1/get/tracking/info?${trackingQuery}`)
                        ).data;
                        const orderStatus = trackedOrder.activity;

                        if (orderStatus) {
                            //1: If Order Shipped Successfuly
                            if (orderStatus.findIndex((order) => order.status === "order_information_received_by_carrier") != -1) {
                                //1:Update The Order if not from cart
                                const updatedOrder = await this.storeOrderService.updateOneByPayload(orderData.orderUID as string, {
                                    orderStatus: "مستلم",
                                    isShipped: true,
                                });

                                if (updatedOrder.isFromCart) {
                                    await this.storeOrderService.updateCartOrders(updatedOrder.cartUID, { orderStatus: "مستلم", isShipped: true });
                                }

                                //2: Update Store Fees if Store Calcs Cycle not finishe
                                if (!updatedOrder.isFinishedStoreCalcsCycle) {
                                    const commesionPrecentage =
                                        storeData.storeSubcreption === "pro"
                                            ? company.storeServicePrecentageProFee
                                            : company.storeServicePrecentageFee;

                                    const commession = Math.trunc(
                                        (updatedOrder.totalPrice / 100) * commesionPrecentage < company.shippedOrderMinFeePrice
                                            ? company.shippedOrderMinFeePrice
                                            : (updatedOrder.totalPrice / 100) * commesionPrecentage
                                    );

                                    //1:Update Store Fees
                                    storeData.$inc("totalUnpaidFees", commession);
                                    storeData.$inc("totalUnpaidOrders", 1);
                                    updatedOrder.orderCommesion = commession;
                                    await updatedOrder.save();
                                    await storeData.save();
                                }

                                if (!updatedOrder.isFinishedConfirmationServiceCalcsCycle) {
                                    //3: Update Store userCallMember Profits if confirmed By Store
                                    if (updatedOrder.confirmedAndShippedBy === "StoreService") {
                                        const userCallMember = await this.userStoreModel.findById(orderData.assignToStoreCallMember);
                                        if (userCallMember) {
                                            userCallMember.$inc("totalOrders", 1);
                                            userCallMember.$inc("totalProfit", Number(storeData.shippedOrderConfirmationMemberFee) || 0);
                                            await userCallMember.save();
                                        }
                                    }

                                    //4: Update Store Confirmation Service Fees if confirmed By Company
                                    if (updatedOrder.confirmedAndShippedBy === "CompanyService") {
                                        const userConfirmation = await this.userConfirmationModel.findById(orderData.assignToStoreCallMember);
                                        if (userConfirmation) {
                                            if (company.confirmationServiceCalcsType === "AdvencedOrderCalcs") {
                                                const commession =
                                                    (updatedOrder.totalPrice / 100) * company.confirmationServicePrecentageFee <
                                                    company.advencedOrderCalcsConfirmationMinPrice
                                                        ? company.advencedOrderCalcsConfirmationMinPrice
                                                        : (updatedOrder.totalPrice / 100) * company.confirmationServicePrecentageFee;

                                                //1: incrase store confirmation service fees
                                                storeData.$inc("totalConfirmationServiceFees", Number(commession));
                                                storeData.$inc("totalConfirmationServiceConfirmedOrders", 0.5);
                                                await storeData.save();

                                                //2: add profits to confirmation service member
                                                if (userConfirmation.allowMonthlyPayment) {
                                                    userConfirmation.$inc("totalConfirmedOrders", 0.5);
                                                    await userConfirmation.save();
                                                } else {
                                                    userConfirmation.$inc("totalConfirmedOrders", 0.5);
                                                    userConfirmation.$inc(
                                                        "totalProfit",
                                                        Number(company.companyAdvencedShippedOrderConfirmationMemberFee) || 0
                                                    );
                                                    await userConfirmation.save();
                                                }
                                            } else if (company.confirmationServiceCalcsType === "OrderShipped") {
                                                //1: incrase store confirmation service fees
                                                storeData.$inc(
                                                    "totalConfirmationServiceFees",
                                                    Number(
                                                        company.afflitaConfirmationFee +
                                                            company.companyConfirmationFee +
                                                            company.memberConfirmationFee
                                                    )
                                                );
                                                storeData.$inc("totalConfirmationServiceConfirmedOrders", 1);
                                                await storeData.save();

                                                //2: add profits to confirmation service member
                                                if (userConfirmation.allowMonthlyPayment) {
                                                    userConfirmation.$inc("totalConfirmedOrders", 1);
                                                    await userConfirmation.save();
                                                } else {
                                                    userConfirmation.$inc("totalConfirmedOrders", 1);
                                                    userConfirmation.$inc("totalProfit", Number(company.memberConfirmationFee) || 0);
                                                    await userConfirmation.save();
                                                }
                                            }
                                        }
                                    }
                                }

                                //Log Action
                                await this.logsUserStoreService.createOrderLogUserStore(
                                    updatedOrder.store,
                                    updatedOrder.store as string,
                                    "Tracking System",
                                    `تم تغيير حالة الطلب من ${orderData.orderStatus} إلى ===> ( مستلم 🤑) بواسطة Tracking System`,
                                    "تحديث",
                                    updatedOrder
                                );
                            } else if (
                                orderStatus.findIndex((order) => order.status.toLowerCase().startsWith("return")) != -1 ||
                                !trackedOrder.success
                            ) {
                                //1:Update The Order if not from cart
                                const updatedOrder = await this.storeOrderService.updateOneByPayload(orderData.orderUID as string, {
                                    orderStatus: "مسترجع",
                                    orderCommesion: company.storeServiceCaclsType === "OrderShipped" ? 0 : orderData.orderCommesion,
                                });

                                if (orderData.isFromCart && orderData.isCartMainOrder) {
                                    await this.storeOrderService.updateCartOrders(orderData.cartUID, { orderStatus: "مسترجع" });
                                }

                                await this.logsUserStoreService.createOrderLogUserStore(
                                    updatedOrder.store,
                                    updatedOrder.store as string,
                                    "Tracking System",
                                    `تم تغيير حالة الطلب من ${orderData.orderStatus} إلى ===> ( مسترجع 🟠) بواسطة Tracking System`,
                                    "تحديث",
                                    updatedOrder
                                );
                            }
                        }
                    } catch (error) {
                        console.log(error.message);
                    }
                }
                //ReLoop
                ordersCheckers();
                return;
            } else {
                await promiseWait(30);
                //ReLoop
                ordersCheckers();
                return;
            }
        };
        ordersCheckers();
    }
}
