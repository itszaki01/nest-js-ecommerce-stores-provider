import { Exclude } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class UpdateStoreDto {
    @IsOptional()
    @IsString()
    themeColor?: string;

    @IsOptional()
    @IsString()
    navTitle?: string;

    @IsOptional()
    @IsString()
    headerTitle?: string;

    @IsOptional()
    @IsString()
    storeTitle?: string;

    @IsOptional()
    @IsString()
    sotreDescription?: string;

    @IsOptional()
    @IsBoolean()
    allowShoppingCart?: boolean;

    @IsOptional()
    @IsBoolean()
    infinitCarouselLoop?: boolean;

    @IsOptional()
    @IsNumber()
    itemsInPage?: number;

    @IsOptional()
    @IsString()
    favicon?: string;

    @IsOptional()
    @IsBoolean()
    showSuggestdProducts?: boolean;

    @IsOptional()
    @IsBoolean()
    allowLocations?: boolean;

    @IsOptional()
    @IsString()
    themeColorOriginal?: string;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    locationPrefix?: string;

    @IsOptional()
    @IsNumber()
    unCompleteOrderSttngs?: number;

    @IsOptional()
    @IsString()
    googleSheetApi?: string;

    @IsOptional()
    @IsString()
    shippingPrefix: string;

    @IsOptional()
    @IsBoolean()
    allowFacebookPixel?: boolean;

    @IsOptional()
    @IsArray()
    facebookPixelIds?: { pixelId: string }[];

    @IsOptional()
    @IsString()
    thankYouPageBody?: string;

    @IsOptional()
    @IsString()
    currencyCode?: string;

    @IsOptional()
    @IsBoolean()
    allowTiktokPixel?: boolean;

    @IsOptional()
    @IsArray()
    tikTokPixelIds?: { pixelId: string }[];

    @IsOptional()
    @IsString()
    countryPhoneCode?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsNumber()
    ordersLimitPerHour?: number;

    @IsOptional()
    @IsString()
    googleTagManagerId?: string;

    @IsOptional()
    @IsBoolean()
    allowGoogleTagManager?: boolean;

    @IsOptional()
    @IsBoolean()
    allowGoogleAnalytics?: boolean;

    @IsOptional()
    @IsString()
    googleAnalyticsId?: string;

    @IsOptional()
    @IsString()
    addressPlaceHolder?: string;

    @IsOptional()
    @IsString()
    policyText?: string;

    @IsOptional()
    @IsBoolean()
    allowWhatsapp?: boolean;

    @IsOptional()
    @IsString()
    whatsappNumber?: string;

    @IsOptional()
    @IsBoolean()
    allowInstagram?: boolean;

    @IsOptional()
    @IsString()
    instagramLink?: string;

    @IsOptional()
    @IsBoolean()
    allowFacebook?: boolean;

    @IsOptional()
    @IsString()
    facebookLink?: string;

    @IsOptional()
    @IsBoolean()
    allowPhoneNumber?: boolean;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    storeRights: string;

    @IsOptional()
    @IsBoolean()
    allowFacebookConvApi?: boolean;

    @IsOptional()
    @IsObject()
    facebookConvApi?: { pixelId: string; access_token: string; allowTestMode: boolean; testCode: string };

    @IsOptional()
    @IsBoolean()
    allowTikTokConvApi?: boolean;

    @IsOptional()
    @IsObject()
    tikTokConvApi?: { pixelId: string; access_token: string; allowTestMode: boolean; testCode: string };

    @IsOptional()
    @IsString()
    headCode?: string;

    @IsOptional()
    @IsObject()
    secondryLogo?: {
        square: boolean;
        logoLink: string;
    };

    @IsOptional()
    @IsBoolean()
    allowCities?: boolean;
    
    @IsNumber()
    @IsOptional()
    shippedOrderConfirmationMemberFee: number;
    
    @IsEnum(["OrderConfirmed", "OrderShipped"])
    @IsOptional()
    confirmationServiceCalcsType: "OrderConfirmed" | "OrderShipped";

    @Exclude()
    id?: string;

    @Exclude()
    createdByStopDesk?: string;

    @Exclude()
    storeOwner?: string;

    @Exclude()
    storeSubDomain?: string;

    @Exclude()
    storeSubcreption?: "basic" | "pro";

    @Exclude()
    apiKey1?: string;

    @Exclude()
    apiKey2?: string;

    @Exclude()
    apiKey3?: string;

    @Exclude()
    apiKey4?: string;

    @Exclude()
    apiKey5?: string;
}
