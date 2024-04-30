import { BadRequestException } from "@nestjs/common";
import axios from "axios";
import { StoreOrder } from "src/modules/store-order/schema/store-order.schema";

export const googleSheetsPost = async (googleSheetKey: string, _data: StoreOrder, properties?: string[] | string) => {
    const data = JSON.parse(JSON.stringify(_data));
    const date = new Date(data.createdAt);

    // Set the time zone (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo', etc.)
    const timeZone = "Africa/Algiers";
    const options = { timeZone: timeZone };

    // Format the date and time with the specified time zone
    const formattedDateTime = date.toLocaleString("en-US", options);

    const orderData: StoreOrder = {
        ...data,
        properties: JSON.stringify(properties).replace(/","/g, "] / [").replace(/\["/g, "[").replace(/"\]/g, "]"),
        storeName: data.isFromCart ? `${data.storeName} 🛒-${data.cartUID.slice(-4).toUpperCase()}` : data.storeName,
        orderDate: `${formattedDateTime.replace(",", " -")}`,
        shippingPrice: data.isFromCart && !data.isCartMainOrder ? 0 : data.shippingPrice,
        fakeShippingPrice: data.isFromCart && !data.isCartMainOrder ? 0 : data.fakeShippingPrice,
        totalPrice: data.isFromCart && !data.isCartMainOrder ? 0 : data.totalPrice,
        orderStatus:
            data.orderStatus === "متروك"
                ? "⚠️ متروك"
                : data.isFromCart && !data.isCartMainOrder
                  ? data.orderStatus === "جديد"
                      ? "سلة 🛒"
                      : data.orderStatus
                  : data.orderStatus,
    };
    const formData = new FormData();
    for (const key in orderData) {
        formData.append(key, String(orderData[key as keyof typeof orderData]));
    }
    try {
        await axios.post(`https://script.google.com/macros/s/${googleSheetKey}/exec`, formData);
    } catch (error) {
        const _error = error as Error;
        throw new BadRequestException(`Google Sheets: ${_error.message}`);
    }
};
