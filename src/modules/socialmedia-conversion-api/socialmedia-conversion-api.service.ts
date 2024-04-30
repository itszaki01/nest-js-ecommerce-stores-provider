import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as bizSdk from "facebook-nodejs-business-sdk";
import { StoreProduct } from "../store-product/schema/store-product.schema";
import { Store } from "../store/schema/store.schema";
import { IFacebookConvApi } from "./interface/facebook-conv-api.interface";
import { CreateStoreOrderPublicDto } from "../store-order/dto/create-store-order-public.dto";
import { FastifyRequest } from "fastify";

const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;
const DeliveryCategory = bizSdk.DeliveryCategory;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;

@Injectable()
export class SocialmediaConversionApiService {
    async facebookConvApi(
        { access_token, allowTestMode, pixelId, testCode }: IFacebookConvApi,
        orderData: CreateStoreOrderPublicDto,
        product: StoreProduct,
        storeSettings: Store,
        req: FastifyRequest
    ) {
        try {
            let phoneNumber: string;
            if (orderData.clientPhoneNumber.startsWith("0")) {
                phoneNumber = orderData.clientPhoneNumber.slice(1, orderData.clientPhoneNumber.length);
            } else {
                phoneNumber = orderData.clientPhoneNumber;
            }

            bizSdk.FacebookAdsApi.init(access_token);
            const current_timestamp = Math.floor(Date.now() / 1000);
            const userData = new UserData().setPhone(`${storeSettings.countryPhoneCode}${phoneNumber}`);

            // It is recommended to send Client IP and User Agent for Conversions API Events.
            if (req.headers["x-real-ip"]) userData.setClientIpAddress(req.headers["x-real-ip"] as string);
            if (req.headers["user-agent"]) userData.setClientUserAgent(req.headers["user-agent"]);
            if (req.cookies.fbp) userData.setFbp(req.cookies.fbp);
            if (req.cookies.fbc) userData.setFbc(req.cookies.fbc);

            const content = new Content()
                .setId(product._id?.toString() as string)
                .setQuantity(orderData.quantity)
                .setDeliveryCategory(orderData.shippingType === "للمكتب" ? DeliveryCategory.CURBSIDE : DeliveryCategory.HOME_DELIVERY)
                .setItemPrice(product.price)
                .setTitle(product.name);

            const customData = new CustomData().setContents([content]).setCurrency(storeSettings.currencyCode).setValue(orderData.totalPrice);

            const serverEvent = new ServerEvent()
                .setEventName("Purchase")
                .setEventTime(current_timestamp)
                .setUserData(userData)
                .setCustomData(customData)
                .setEventSourceUrl(`https://${req.hostname}/p/${product.slug}`)
                .setActionSource("website")
                .setEventId(`${product._id?.toString()}${phoneNumber}${new Date().getFullYear()}${new Date().getMonth()}${new Date().getDate()}`);

            const eventsData = [serverEvent];
            const eventRequest = new EventRequest(access_token, pixelId).setEvents(eventsData);
            if (allowTestMode) eventRequest.setTestEventCode(testCode);

            await eventRequest.execute();
            return { message: "success" };
        } catch (_error) {
            const error = _error as Error;
            throw new InternalServerErrorException(error.message);
        }
    }
}
