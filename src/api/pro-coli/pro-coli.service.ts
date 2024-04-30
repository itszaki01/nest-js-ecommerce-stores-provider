import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import axios from "axios";
import { StoreOrder } from "src/modules/store-order/schema/store-order.schema";
import { Store } from "src/modules/store/schema/store.schema";
import { generateRandomOrderId } from "../utils/generateRandomOrderId";
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

const axios6sTO = axios.create({
    timeout: 6000,
});

@Injectable()
export class ProColiService {
    constructor(
        @InjectModel(StoreOrder.name) private storeOrderModel: Model<StoreOrder>,
        @InjectModel(UserStore.name) private userStoreModel: Model<UserStore>,
        @InjectModel(StoreProduct.name) private storeProductModel: Model<StoreProduct>,
        @InjectModel(UserConfirmation.name) private userConfirmationModel: Model<UserConfirmation>,
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
        const orderDataLocationIndex = orderData.clientLocation.split("-")[0];

        const headers = {
            token: storeData.apiKey1,
            key: storeData.apiKey2,
        };

        const Tracking = `${generateRandomOrderId()}`;
        const id_Externe = `${generateRandomOrderId()}`;

        const orderToShipObj = {
            Colis: [
                {
                    // Premier Colis
                    Tracking,
                    TypeLivraison: orderData.shippingType === "للمكتب" ? "1" : "0", // Domicile : 0 & Stopdesk : 1
                    TypeColis: "0", // Echange : 1
                    Confrimee: "0", // 1 pour les colis Confirmer directement en pret a expedier
                    Client: orderData.clientName,
                    MobileA: orderData.clientPhoneNumber,
                    MobileB: "",
                    Adresse: orderData.clientAddress,
                    IDWilaya: orderDataLocationIndex,
                    Commune: orderData.clientAddress,
                    Total: orderData.totalPrice,
                    Note: `${orderData.note || ""}`,
                    TProduit: productsSkus.length >= 2 ? productsSkus.join("+") : `${orderData.productSku} (${orderData.quantity})`,
                    id_Externe, // Votre ID ou Tracking
                    Source: "",
                },
            ],
        };

        try {
            await axios.post("https://procolis.com/api_v1/add_colis", orderToShipObj, { headers });

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
                orderId: Tracking,
                orderCommesion: commesion,
            };
        } catch (error) {
            console.log(error.message);
            throw new BadRequestException("حدث خطأ أثناء طلب شحن المنتج");
        }
    }

    async verifyApi(accesKeys: { key: string; token: string }) {
        const key = accesKeys.key;
        const token = accesKeys.token;
        const headers = { key, token };
        try {
            const data = await axios.get<{ Statut: string }>("https://procolis.com/api_v1/token", { headers });
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
                    const trackingObj = {
                        Colis: [
                            {
                                Tracking: orderData.orderTracking,
                            },
                        ],
                    };

                    const storeKeys = {
                        token: storeData.apiKey1,
                        key: storeData.apiKey2,
                    };

                    //3:Get Order Status
                    try {
                        const trackedOrder = await axios6sTO.post("https://procolis.com/api_v1/lire", trackingObj, { headers: storeKeys });
                        const orderStatus = trackedOrder.data?.Colis[0]?.Situation as string;

                        if (orderStatus) {
                            //1: If Order Shipped Successfuly
                            if (orderStatus === "En Préparation") {
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
                            } else if (orderStatus === "Supprimée") {
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
