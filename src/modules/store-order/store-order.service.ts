import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateStoreOrderDto } from "./dto/create-store-order.dto";
import { UpdateStoreOrderDto } from "./dto/update-store-order.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { StoreOrder, StoreOrderDocument } from "./schema/store-order.schema";
import { Model } from "mongoose";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { TQueryParams } from "src/@types/QueryParams.type";
import { googleSheetsPost } from "src/utils/googleSheetsPost";
import { StoreProductService } from "../store-product/store-product.service";
import { StoreService } from "../store/store.service";
import { CreateStoreOrderPublicDto } from "./dto/create-store-order-public.dto";
import { SocialmediaConversionApiService } from "../socialmedia-conversion-api/socialmedia-conversion-api.service";
import { FastifyRequest } from "fastify";
import { StoreApplications } from "../store-applications/scheam/store-application.schema";
import { UserStore } from "../user-store/schema/user-store.schema";
import { UserConfirmation } from "../user-confirmation/schema/user-confirmation.schema";
import { CompanyService } from "../company/company.service";
import { Store } from "../store/schema/store.schema";
import parseMongoJSON from "src/utils/parseMongoJSON";

@Injectable()
export class StoreOrderService {
    constructor(
        @InjectModel(StoreOrder.name) private storeOrderModel: Model<StoreOrder>,
        @InjectModel(StoreApplications.name) private storeApplicationsModel: Model<StoreApplications>,
        @InjectModel(UserStore.name) private userStoreModel: Model<UserStore>,
        @InjectModel(UserConfirmation.name) private userConfirmationModel: Model<UserConfirmation>,
        private readonly companyService: CompanyService,
        private readonly storeProductService: StoreProductService,
        private readonly storeService: StoreService,
        private readonly socialMediaConvApiService: SocialmediaConversionApiService
    ) {}

    async createPublicOrder(createStoreOrderPublicDto: CreateStoreOrderPublicDto, storeId: string, req: FastifyRequest) {
        //1: check if product is Exist
        const product = await this.storeProductService.findOneByPayload(createStoreOrderPublicDto.productId, storeId);

        //2: Get Store Settings
        const storeSettings = await this.storeService.findOneByPayload({ _id: storeId });

        //2.1 Set Targeted Store
        const mainStoreId = storeSettings.isSubStore ? storeSettings.mainStore : storeId;

        //3: first: check if order is Exist Before
        const order = await this.storeOrderModel.findOne({ orderUID: createStoreOrderPublicDto.orderUID });

        //4:Get Store Applications
        const storeApplications = await this.storeApplicationsModel.findOne({ store: storeId });

        //4:Send Events to Conversion Api's
        //4.1 if fb conv api send events
        if (storeSettings.allowFacebookConvApi && createStoreOrderPublicDto.orderStatus != "متروك") {
            this.socialMediaConvApiService.facebookConvApi(storeSettings.facebookConvApi, createStoreOrderPublicDto, product, storeSettings, req);
        }
        //4.2 send facebook apis events
        if (
            storeApplications &&
            storeApplications.allowFacebookConvApis &&
            storeApplications.facebookConvApis.length > 0 &&
            storeSettings.storeSubcreption === "pro" &&
            createStoreOrderPublicDto.orderStatus != "متروك"
        ) {
            storeApplications.facebookConvApis.map(
                async (apiData) =>
                    await this.socialMediaConvApiService.facebookConvApi(apiData, createStoreOrderPublicDto, product, storeSettings, req)
            );
        }

        //5: if order Exist Before Just Update It
        if (order) {
            const order = await this.storeOrderModel.findOneAndUpdate(
                { orderUID: createStoreOrderPublicDto.orderUID },
                {
                    ...createStoreOrderPublicDto,
                    store: mainStoreId,
                    imageCover: product.imageCover,
                    storeName: storeSettings.storeSubDomain,
                    properties: JSON.stringify(createStoreOrderPublicDto.properties)
                        .replace(/","/g, "] / [")
                        .replace(/\["/g, "[")
                        .replace(/"\]/g, "]"),
                },
                { new: true }
            );

            //2:Create Google Sheet Order
            // if product has special google sheet check if to send to all sheets or no
            if (
                product.allowSpecialGoogleSheet &&
                product.specialGoogleSheetsApiKey &&
                storeSettings.storeSubcreption === "pro" &&
                !product.allowSendOrderToAllSheets &&
                order
            ) {
                await googleSheetsPost(product.specialGoogleSheetsApiKey, order, createStoreOrderPublicDto.properties);
            } else {
                if (product.allowSpecialGoogleSheet && product.specialGoogleSheetsApiKey && storeSettings.storeSubcreption === "pro" && order) {
                    await googleSheetsPost(product.specialGoogleSheetsApiKey, order, createStoreOrderPublicDto.properties);
                }

                if (storeSettings.googleSheetApi && order) {
                    await googleSheetsPost(storeSettings.googleSheetApi, order, createStoreOrderPublicDto.properties);
                }

                if (
                    storeApplications &&
                    storeApplications.allowGoogleSheetsApis &&
                    storeApplications.googleSheetsApis.length > 0 &&
                    storeSettings.storeSubcreption === "pro"
                ) {
                    if (order) {
                        storeApplications.googleSheetsApis.map(
                            async (apiData) => await googleSheetsPost(apiData.apiKey, order, createStoreOrderPublicDto.properties)
                        );
                    }
                }
            }

            return order;
        } else {
            //0.5 Get Main Store
            const mainStore = storeSettings.isSubStore ? await this.storeService.findOne(mainStoreId) : storeSettings;

            //1:Create Order
            const order = (await this.storeOrderModel.create({
                ...createStoreOrderPublicDto,
                expireAt: new Date(Date.now() + 3600 * 1000 * 720),
                store: mainStoreId,
                imageCover: product.imageCover,
                storeName: storeSettings.storeSubDomain,
                isFromSubStore: storeSettings.isSubStore,
                subStore: storeSettings._id,
                properties: JSON.stringify(createStoreOrderPublicDto.properties).replace(/","/g, "] / [").replace(/\["/g, "[").replace(/"\]/g, "]"),
            })) as StoreOrderDocument & { createdAt: Date };

            //2:Create Google Sheet Order
            // if product has special google sheet check if to send to all sheets or no
            if (
                product.allowSpecialGoogleSheet &&
                product.specialGoogleSheetsApiKey &&
                storeSettings.storeSubcreption === "pro" &&
                !product.allowSendOrderToAllSheets &&
                order
            ) {
                await googleSheetsPost(product.specialGoogleSheetsApiKey, order, createStoreOrderPublicDto.properties);
            } else {
                if (product.allowSpecialGoogleSheet && product.specialGoogleSheetsApiKey && storeSettings.storeSubcreption === "pro" && order) {
                    await googleSheetsPost(product.specialGoogleSheetsApiKey, order, createStoreOrderPublicDto.properties);
                }

                if (storeSettings.googleSheetApi && order) {
                    await googleSheetsPost(storeSettings.googleSheetApi, order, createStoreOrderPublicDto.properties);
                }

                if (
                    storeApplications &&
                    storeApplications.allowGoogleSheetsApis &&
                    storeApplications.googleSheetsApis.length > 0 &&
                    storeSettings.storeSubcreption === "pro"
                ) {
                    if (order) {
                        storeApplications.googleSheetsApis.map(
                            async (apiData) => await googleSheetsPost(apiData.apiKey, order, createStoreOrderPublicDto.properties)
                        );
                    }
                }
            }

            //2.1 check if order is from cart if true assign all orders to the same call member
            if (order.isFromCart && !order.isCartMainOrder) {
                const mainCartOrder = (await this.storeOrderModel.findOne({
                    cartUID: order.cartUID,
                    isCartMainOrder: true,
                })) as StoreOrderDocument & { createdAt: Date };
                await this.storeOrderModel.updateMany(
                    {
                        cartUID: mainCartOrder.cartUID,
                    },
                    {
                        assignToStoreCallMember: mainCartOrder.assignToStoreCallMember,
                    }
                );
                return order;
            }

            //3:Assign Order To Confirmation Members if they exist
            if (mainStore.allowConfirmationService) {
                const confirmationMembers = await this.userConfirmationModel.find({ isActive: true });
                const company = await this.companyService.findeOne();
                if (confirmationMembers.length > 0) {
                    if (company.currentConfirmationMemberIdx < confirmationMembers.length) {
                        order.assignToStoreCallMember = confirmationMembers[company.currentConfirmationMemberIdx]._id;
                        company.$inc("currentConfirmationMemberIdx", 1);
                        await company.save();
                        await order.save();
                    } else if (company.currentConfirmationMemberIdx >= confirmationMembers.length) {
                        order.assignToStoreCallMember = confirmationMembers[0]._id;
                        company.currentConfirmationMemberIdx = 1;
                        await company.save();
                        await order.save();
                    }
                    return order;
                }
            } else {
                const confirmationMembers = await this.userStoreModel.find({ store: mainStoreId, role: "StoreCallMember", isActive: true });

                if (confirmationMembers.length > 0) {
                    if (mainStore.currentConfirmationMemberIdx < confirmationMembers.length) {
                        order.assignToStoreCallMember = confirmationMembers[mainStore.currentConfirmationMemberIdx]._id;
                        mainStore.$inc("currentConfirmationMemberIdx", 1);
                        await order.save();
                        await mainStore.save();
                    } else if (mainStore.currentConfirmationMemberIdx >= confirmationMembers.length) {
                        order.assignToStoreCallMember = confirmationMembers[0]._id;
                        mainStore.currentConfirmationMemberIdx = 1;
                        await order.save();
                        await mainStore.save();
                    }
                }
            }

            return order;
        }
    }

    async create(createStoreOrderDto: CreateStoreOrderDto, storeId: string) {
        //1: check if product is Exist
        const product = await this.storeProductService.findOneByPayload(createStoreOrderDto.productId, storeId);

        //2: Get Store Settings
        const storeSettings = await this.storeService.findOneByPayload({ _id: storeId });

        //3: first: check if order is Exist Before
        const order = await this.storeOrderModel.findOne({ orderUID: createStoreOrderDto.orderUID });

        //if order Exist Before Just Update It
        if (order) {
            const order = await this.storeOrderModel.findOneAndUpdate(
                { orderUID: createStoreOrderDto.orderUID },
                {
                    ...createStoreOrderDto,
                    properties: JSON.stringify(createStoreOrderDto.properties).replace(/","/g, "] / [").replace(/\["/g, "[").replace(/"\]/g, "]"),
                },
                { new: true }
            );

            //2:Create Google Sheet Order
            if (storeSettings.googleSheetApi && order) {
                await googleSheetsPost(storeSettings.googleSheetApi, order, createStoreOrderDto.properties);
            }
            return order;
        } else {
            //1:Create Order
            const order = await this.storeOrderModel.create({
                ...createStoreOrderDto,
                properties: JSON.stringify(createStoreOrderDto.properties).replace(/","/g, "] / [").replace(/\["/g, "[").replace(/"\]/g, "]"),
                productPrice: product.price,
                totalPrice: product.price * createStoreOrderDto.quantity + createStoreOrderDto.fakeShippingPrice || 0,
            });

            //2:Create Google Sheet Order
            // if (storeSettings[0].googleSheetApi && order && order.orderStatus != "متروك") {
            //     await googleSheetsPost(storeSettings[0].googleSheetApi, order, createStoreOrderDto.properties);
            // }
            if (storeSettings.googleSheetApi && order) {
                await googleSheetsPost(storeSettings.googleSheetApi, order, createStoreOrderDto.properties);
            }
            return this.storeOrderModel.create({ ...createStoreOrderDto, store: storeId });
        }
    }

    async findAll(user: UserStore | UserConfirmation, queryParams: TQueryParams & { orderStatus?: string }) {
        let filterObj = {};
        if (user.role === "StoreCallMember") {
            filterObj = { store: user.store, assignToStoreCallMember: user._id as string };
        } else if (user.role === "UserConfirmation") {
            filterObj = { assignToStoreCallMember: user._id as string };
        } else {
            filterObj = { store: user.store };
        }

        const apiFeatures = await apiFeaturesHelper(this.storeOrderModel, this.storeOrderModel, queryParams, filterObj);
        if (queryParams.orderStatus) {
            const re = new RegExp("^محاولة");
            if (queryParams.orderStatus == "لم يتم الرد") {
                const documents = await apiFeatures.mongooseQuery.where("orderStatus").regex(re);
                const totalResults = await this.storeOrderModel.countDocuments({ ...filterObj, orderStatus: re });
                return {
                    results: documents.length,
                    ...apiFeatures.paginateResults,
                    totalPages: Math.ceil(totalResults / Number(queryParams.limit) || 10).toFixed(0),
                    documents,
                };
            } else {
                const documents = await apiFeatures.mongooseQuery.where("orderStatus").eq(queryParams.orderStatus);
                const totalResults = await this.storeOrderModel.countDocuments({ ...filterObj, orderStatus: queryParams.orderStatus });
                return {
                    results: documents.length,
                    ...apiFeatures.paginateResults,
                    totalPages: Math.ceil(totalResults / Number(queryParams.limit) || 10).toFixed(0),
                    documents,
                };
            }
        } else {
            const documents = await apiFeatures.mongooseQuery.where("orderStatus").ne("متروك");
            return {
                results: documents.length,
                ...apiFeatures.paginateResults,
                documents,
            };
        }
    }

    async findAllUnPaidFeesOrders(storeId: string, queryParams: TQueryParams) {
        //1:Get Company
        const company = await this.companyService.findeOne();
        let filterObj = {};
        if (company.storeServiceCaclsType === "OrderShipped") {
            filterObj = {
                store: storeId,
                isFeesPaid: false,
                isInDelivery: true,
                isShipped: true,
                isCartMainOrder: true,
            };
        } else if (company.storeServiceCaclsType === "OrderConfirmed") {
            filterObj = {
                store: storeId,
                isFeesPaid: false,
                isInDelivery: true,
                isCartMainOrder: true,
            };
        }
        const apiFeatures = await apiFeaturesHelper(this.storeOrderModel, this.storeOrderModel, queryParams, filterObj);
        const documents = await apiFeatures.mongooseQuery;
        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    async findAllUnpaidMembersOrders(userId: string, queryParams: TQueryParams, store?: Store) {
        let filterObj = {};
        if (store?.confirmationServiceCalcsType === "OrderConfirmed") {
            filterObj = {
                isStoreFeesPaid: false,
                isInDelivery: true,
                isCartMainOrder: true,
                assignToStoreCallMember: userId,
            };
        } else if (store?.confirmationServiceCalcsType === "OrderShipped") {
            filterObj = {
                isStoreFeesPaid: false,
                isInDelivery: true,
                isCartMainOrder: true,
                assignToStoreCallMember: userId,
                isShipped: true,
            };
        } else {
            filterObj = filterObj = {
                isStoreFeesPaid: false,
                isInDelivery: true,
                isCartMainOrder: true,
                assignToStoreCallMember: userId,
            };
        }
        const apiFeatures = await apiFeaturesHelper(this.storeOrderModel, this.storeOrderModel, queryParams, filterObj);
        const documents = await apiFeatures.mongooseQuery;
        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    async findAllStatus(user: UserStore | UserConfirmation) {
        let filterObj = {};
        if (user.role === "StoreCallMember") {
            filterObj = { store: user.store, assignToStoreCallMember: user._id as string };
        } else if (user.role === "UserConfirmation") {
            filterObj = { assignToStoreCallMember: user._id as string };
        } else {
            filterObj = { store: user.store };
        }
        const re = new RegExp("^محاولة");
        const newOrders = await this.storeOrderModel.countDocuments({ orderStatus: "جديد", ...filterObj, isCartMainOrder: true });
        const callingsProcess = await this.storeOrderModel.countDocuments({ orderStatus: re, ...filterObj, isCartMainOrder: true });
        const cancledOrders = await this.storeOrderModel.countDocuments({ orderStatus: "ملغي", ...filterObj, isCartMainOrder: true });
        const inDelivery = await this.storeOrderModel.countDocuments({ orderStatus: "قيد التوصيل", ...filterObj, isCartMainOrder: true });
        const unCompleted = await this.storeOrderModel.countDocuments({ orderStatus: "متروك", ...filterObj, isCartMainOrder: true });
        const completed = await this.storeOrderModel.countDocuments({ orderStatus: "مستلم", ...filterObj, isCartMainOrder: true });
        const confirmed = await this.storeOrderModel.countDocuments({ orderStatus: "مأكد", ...filterObj, isCartMainOrder: true });
        const retour = await this.storeOrderModel.countDocuments({ orderStatus: "مسترجع", ...filterObj, isCartMainOrder: true });

        return {
            newOrders,
            callingsProcess,
            cancledOrders,
            inDelivery,
            unCompleted,
            completed,
            confirmed,
            retour,
        };
    }

    async findOneByPayload(orderId: string, storeId: string) {
        return HandlersFactory.findOneByPayload(this.storeOrderModel, { store: storeId, orderUID: orderId }, ErrorMessages.NO_ORDER_FOUND);
    }

    async findOneByUUId(orderId: string) {
        return HandlersFactory.findOneByPayload(this.storeOrderModel, { orderUID: orderId }, ErrorMessages.NO_ORDER_FOUND);
    }

    async update(orderId: string, updateStoreOrderDto: UpdateStoreOrderDto) {
        return HandlersFactory.update(this.storeOrderModel, { ...updateStoreOrderDto }, orderId);
    }

    async updateOneByPayload(orderId: string, updateStoreOrderDto: Partial<StoreOrder>) {
        //1: update order
        const order = await HandlersFactory.updateOneByPayload(
            this.storeOrderModel,
            { orderUID: orderId },
            { ...updateStoreOrderDto },
            ErrorMessages.NO_ORDER_FOUND
        );

        //1.1 If order from cart update all orders
        if (order.isFromCart && order.isCartMainOrder) {
            this.updateCartOrders(order.cartUID, updateStoreOrderDto);
            return order;
        }

        //2:Get Store Settings
        const storeSettings = await this.storeService.findOneByPayload({ _id: order.isFromSubStore ? order.subStore : order.store });

        //3:Get Store Applications
        const storeApplications = await this.storeApplicationsModel.findOne({ store: order.isFromSubStore ? order.subStore : order.store });

        //4: Get Product
        const product = await this.storeProductService.findOneByPayload(order.productId, order.isFromSubStore ? order.subStore : order.store);

        //5:Create Google Sheet Order
        // if product has special google sheet check if to send to all sheets or no
        if (
            product.allowSpecialGoogleSheet &&
            product.specialGoogleSheetsApiKey &&
            storeSettings.storeSubcreption === "pro" &&
            !product.allowSendOrderToAllSheets &&
            order
        ) {
            await googleSheetsPost(product.specialGoogleSheetsApiKey, order, order.properties);
        } else {
            if (product.allowSpecialGoogleSheet && product.specialGoogleSheetsApiKey && storeSettings.storeSubcreption === "pro" && order) {
                await googleSheetsPost(product.specialGoogleSheetsApiKey, order, order.properties);
            }

            if (storeSettings.googleSheetApi && order) {
                await googleSheetsPost(storeSettings.googleSheetApi, order, order.properties);
            }

            if (
                storeApplications &&
                storeApplications.allowGoogleSheetsApis &&
                storeApplications.googleSheetsApis.length > 0 &&
                storeSettings.storeSubcreption === "pro"
            ) {
                if (order) {
                    storeApplications.googleSheetsApis.map(async (apiData) => await googleSheetsPost(apiData.apiKey, order, order.properties));
                }
            }
        }
        return order;
    }

    async updateCartOrders(cartUID: string, updateStoreOrderDto: UpdateStoreOrderDto) {
        const orders = await this.storeOrderModel.find({ cartUID });
        if (orders.length < 1) throw new NotFoundException("لايوجد منتجات لتحديثها");

        //0:Update All Cart Products Status
        await this.storeOrderModel.updateMany({ cartUID }, { ...updateStoreOrderDto });

        //1:Get Store Applications
        const storeApplications = await this.storeApplicationsModel.findOne({ store: orders[0].store });

        //2: Get Store Settings
        const storeSettings = await this.storeService.findOneByPayload({ _id: orders[0].store });

        const toUpdateOrders = orders.map(async (_order) => {
            const order: StoreOrder = {
                ...parseMongoJSON(_order),
                orderStatus: updateStoreOrderDto.orderStatus as
                    | "جديد"
                    | "متروك"
                    | "محاولة 1"
                    | "محاولة 2"
                    | "محاولة 3"
                    | "مأكد"
                    | "ملغي"
                    | "قيد التوصيل"
                    | "مستلم"
                    | "مسترجع",
            };
            //3: Get PRoduct Data
            const product = await this.storeProductService.findOneByPayload(order.productId, order.store);

            // if product has special google sheet check if to send to all sheets or no
            if (
                product.allowSpecialGoogleSheet &&
                product.specialGoogleSheetsApiKey &&
                storeSettings.storeSubcreption === "pro" &&
                !product.allowSendOrderToAllSheets &&
                order
            ) {
                await googleSheetsPost(product.specialGoogleSheetsApiKey, order, order.properties);
            } else {
                if (product.allowSpecialGoogleSheet && product.specialGoogleSheetsApiKey && storeSettings.storeSubcreption === "pro" && order) {
                    await googleSheetsPost(product.specialGoogleSheetsApiKey, order, order.properties);
                }

                if (storeSettings.googleSheetApi && order) {
                    await googleSheetsPost(storeSettings.googleSheetApi, order, order.properties);
                }

                if (
                    storeApplications &&
                    storeApplications.allowGoogleSheetsApis &&
                    storeApplications.googleSheetsApis.length > 0 &&
                    storeSettings.storeSubcreption === "pro"
                ) {
                    if (order) {
                        storeApplications.googleSheetsApis.map(async (apiData) => await googleSheetsPost(apiData.apiKey, order, order.properties));
                    }
                }
            }
        });
        await Promise.all(toUpdateOrders);
        return "success";
    }

    async removeOneByPayload(orderId: string, storeId: string) {
        //1: check if order is indelvery
        const order = await this.findOneByPayload(orderId, storeId);
        if (order.isInDelivery) {
            throw new BadRequestException("لايمكن حذف طلب قيد التوصيل");
        }

        //2: update the order to Anulle to chene it on google sheet
        await this.updateOneByPayload(orderId, { orderStatus: "ملغي" });

        return HandlersFactory.removeOneByPayload(this.storeOrderModel, { store: storeId, orderUID: orderId }, ErrorMessages.NO_ORDER_FOUND);
    }
}
