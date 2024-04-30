import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthStopDeskGuard } from "src/modules/auth-stop-desk-user/guards/auth-stop-desk-user.guard";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { ProColiService } from "./pro-coli/pro-coli.service";
import axios from "axios";
import { UserStoreAuth } from "src/modules/auth-store-user/decorator/user-store-auth.decorator";
import * as https from "https";

@Controller("api")
export class ApiController {
    constructor(private readonly proColiService: ProColiService) {}

    @UseGuards(AuthStopDeskGuard)
    @Get("check-api")
    async checkApi(@Query() accesKeys: object) {
        if (EnviromentsClass.COMPNAY_ECO_SYSTEM === "pro-coli") {
            return await this.proColiService.verifyApi(accesKeys as { key: string; token: string });
        }
    }

    @UserStoreAuth("StoreAdmin", "StoreManager")
    @Get("check-sheet-api")
    async checkSheetApi(@Query("sheetKey") sheetKey: string) {
        const date = new Date();
        const timeZone = "Africa/Algiers";
        const options = { timeZone: timeZone };

        // Format the date and time with the specified time zone
        const formattedDateTime = date.toLocaleString("en-US", options);

        const orderData = {
            orderType: "طلب تجريبي",
            productShortName: "طلب تجريبي",
            clientName: "طلب تجريبي",
            clientPhoneNumber: "0000000000",
            clientLocation: "طلب تجريبي",
            clientAddress: "طلب تجريبي",
            orderDate: `${formattedDateTime.replace(",", " -")}`,
            orderStatus: "مأكد",
        };
        const formData = new FormData();
        for (const key in orderData) {
            formData.append(key, String(orderData[key as keyof typeof orderData]));
        }
        try {
      
            await axios.post(`https://script.google.com/macros/s/${sheetKey}/exec`, formData,);
            return { message: "تم إرسال الطلب التجريبي بشكل صحيح" };
        } catch (error) {
            throw new BadRequestException("لم تتم العملية بشكل صحيح يرجى مراجعة معلومات الربط مع Google Sheets");
        }
    }
}
