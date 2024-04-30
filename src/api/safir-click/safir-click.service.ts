import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import axios from "axios";
import { ISafirClickUsersRES } from "./interface/user.interface";
import { StoreOrder } from "src/modules/store-order/schema/store-order.schema";
import { Store } from "src/modules/store/schema/store.schema";
import { IProductSafiClickRES } from "./interface/product.interface";
import { OrderSafirClickRES } from "./interface/order.interface";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { safirWilayaList } from "./constants/safir-wilaya-list";

@Injectable()
export class SafirClickService {
    private readonly headers = {
        Authorization: `Basic ${EnviromentsClass.SAFIT_CLICK_API_ATUH_TOKEN}`,
    };

    async checkUserSignUp(email: string): Promise<string> {
        try {
            //1: Get UserId By Email
            const users = (
                await axios.get<ISafirClickUsersRES>(`${EnviromentsClass.SAFIR_CLICK_API_LINK}/api.php?_d=users&email=${email}&ajax_custom=1`, {
                    headers: this.headers,
                })
            ).data.users;

            //2:Check If UserIsExist
            if (users.length === 0) {
                throw new BadRequestException("البريد الإلكتروني غير صحيح، الرجاء إدخال نفس البريد الإلكتروني المسجل في سفير كليك");
            }

            if (!users[0].user_id) {
                throw new BadRequestException("البريد الإلكتروني غير صحيح، الرجاء إدخال نفس البريد الإلكتروني المسجل في سفير كليك");
            }

            //3: Check If User Is Allowed To SignUp By checking UserGroups
            const userGroups = (
                await axios.get<object>(`${EnviromentsClass.SAFIR_CLICK_API_LINK}/api.php?_d=users/${users[0].user_id}/usergroups&ajax_custom=1`, {
                    headers: this.headers,
                })
            ).data;
            const extractedUserObjectKeys = Object.keys(userGroups);
            if (!extractedUserObjectKeys.includes(EnviromentsClass.SAFIR_CLICK_ALLOW_USERGROUP_ID)) {
                throw new BadRequestException("ليس لديك صلاحيات للتسجيل في متجر سفير كليك، الرجاء التواصل معنا أولا");
            }

            //return user id
            return users[0].user_id;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async shipTheOrder(orderData: StoreOrder, storeData: Store) {
        try {
            //1: Validate Location Is Exist:Get Product From Safir
            const orderDataLocationIndex = orderData.clientLocation.split("-")[0];
            if (isNaN(+orderDataLocationIndex)) {
                throw new BadRequestException("الرجاء إدخاء الولاية قبل شحن الطلب");
            }

            //2:
            const products = (
                await axios.get<IProductSafiClickRES>(
                    `${EnviromentsClass.SAFIR_CLICK_API_LINK}/api.php?ajax_custom=1&status=A&_d=products&items_per_page=10&q=${orderData.productSku}`,
                    { headers: this.headers }
                )
            ).data.products;

            const productIndex = products.findIndex((product) => product.product_code.toLowerCase() === orderData.productSku.toLowerCase());
            if (productIndex === -1) {
                throw new NotFoundException("يرجى التحقق من رمز ال SKU لم يتم العثور على المنتج لشحنة");
            }

            const product = products[productIndex]; //Product

            //Wilaya Info
            const wilayaToShip = safirWilayaList.find((wilaya) => wilaya.includes(orderDataLocationIndex));

            //2:Create Fake Order
            const newOrderObject = {
                user_id: "0",
                payment_id: "6",
                shipping_id: "",
                cp_profile_type: "I",
                profile_type: "P",
                products: {
                    [`${product.product_id}`]: {
                        amount: orderData.quantity,
                    },
                },
                user_data: {
                    s_firstname: orderData.clientName,
                    s_lastname: orderData.clientName,
                    s_address: orderData.clientAddress,
                    s_city: orderData.clientAddress,
                    s_state: wilayaToShip,
                    s_country: "DZ",
                    s_phone: orderData.clientPhoneNumber,
                    phone: orderData.clientPhoneNumber,
                },
            };
            const newOrderData = (
                await axios.post<OrderSafirClickRES>(`${EnviromentsClass.SAFIR_CLICK_API_LINK}/api.php?_d=orders&ajax_custom=1`, newOrderObject, {
                    headers: this.headers,
                })
            ).data;

            const wilayaShippingPrice = parseInt(newOrderData.order_data.shipping_cost);
            const productFees = (parseInt(product.price) - parseInt(product.cp_min_profit_value)) * orderData.quantity;
            const totalFees = productFees + wilayaShippingPrice;
            const totalProfit =
                orderData.totalPrice > productFees ? orderData.totalPrice - totalFees : parseInt(product.cp_min_profit_value) * orderData.quantity;
            const realTotal = parseInt(product.price) * orderData.quantity + wilayaShippingPrice;

            //4:Update Order User
            const updateOrderObject = {
                user_id: storeData.apiKey1,
                profile_id: storeData.apiKey1,
                firstname: orderData.clientName,
                lastname: orderData.clientName,
                b_firstname: "safir-store",
                b_lastname: "safir-store",
                b_address: "",
                b_address_2: "",
                b_city: "alg",
                b_county: "",
                b_state: wilayaToShip,
                b_country: "DZ",
                b_zipcode: "",
                b_phone: orderData.clientPhoneNumber,
                s_firstname: orderData.clientName,
                s_lastname: orderData.clientName,
                s_address: orderData.clientAddress,
                s_address_2: "",
                s_city: orderData.clientAddress,
                s_county: "",
                s_state: wilayaToShip,
                s_country: "DZ",
                s_zipcode: "16000",
                s_phone: orderData.clientPhoneNumber,
                s_address_type: "",
                phone: orderData.clientPhoneNumber,
                cp_total_order_profit: totalProfit,
                cp_profit_value: totalProfit,
                cp_original_price: product.price,
                cp_profit_value_default: product.cp_min_profit_value,
                total: realTotal > orderData.totalPrice ? realTotal : orderData.totalPrice,
            };

            await axios.put(`${EnviromentsClass.SAFIR_CLICK_API_LINK}/api.php?_d=orders/${newOrderData.order_id}&ajax_custom=1`, updateOrderObject, {
                headers: this.headers,
            });

            return { orderId: newOrderData, orderCommesion: totalProfit };
        } catch (error) {
            throw new BadRequestException(error.response?.data.message as unknown as string);
        }
    }
}
