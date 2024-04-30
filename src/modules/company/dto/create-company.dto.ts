import { Exclude } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class CreateCompanyDto {
    @IsNotEmpty()
    @IsBoolean()
    allowSubScreaptions: boolean;

    @IsNotEmpty()
    @IsBoolean()
    allowSignUp: boolean;

    @IsNotEmpty()
    @IsBoolean()
    allowStopDeskShipping: boolean;

    @IsBoolean()
    @IsOptional()
    isShippingCompany: boolean;

    @IsNotEmpty()
    @IsString()
    logo: string;

    @IsNotEmpty()
    @IsString()
    companyNameAr: string;

    @IsNotEmpty()
    @IsString()
    companyNameFr: string;

    @IsString()
    explainVediosLink?: string;

    @IsNotEmpty()
    @IsString()
    companyFbPage: string;

    @IsBoolean()
    @IsNotEmpty()
    allowCopyRigths: boolean;

    @IsString()
    @IsOptional()
    reportProblemContact?: string;

    @IsNotEmpty()
    @IsString()
    compnayBaseUrl: string;

    @IsNotEmpty()
    @IsString()
    companyEcoSystem: string;

    @IsNotEmpty()
    @IsString()
    companyCdnUrl: string;

    @IsNotEmpty()
    @IsString()
    ns1: string;

    @IsNotEmpty()
    @IsString()
    ns2: string;

    @IsNotEmpty()
    @IsString()
    themeColor: string;

    @IsNotEmpty()
    @IsString()
    textColor: string;

    // @IsBoolean()
    // @IsNotEmpty()
    // allowBulkShipping: boolean;

    @IsNumber()
    @IsNotEmpty()
    memberConfirmationFee: number;

    @IsNumber()
    @IsNotEmpty()
    afflitaConfirmationFee: number;

    @IsNumber()
    @IsNotEmpty()
    companyConfirmationFee: number;

    @IsBoolean()
    @IsNotEmpty()
    allowOrdersAutoTracking: boolean;

    @IsBoolean()
    @IsNotEmpty()
    allowCompanyShoppingCart:boolean
    
    @IsNotEmpty()
    @IsEnum(["OrderConfirmed", "OrderShipped", "AdvencedOrderCalcs"])
    confirmationServiceCalcsType: "OrderConfirmed" | "OrderShipped" | "AdvencedOrderCalcs";

    @IsBoolean()
    @IsNotEmpty()
    allowMonthlySubscription:boolean
    
    @IsObject()
    @IsOptional()
    monthlySubScreptionFees: {
        basicSubscriptionFeeAfflita: number;
        basicSubscriptionFee: number;
        proSubscriptionFeeAfflita: number;
        proSubscriptionFee: number;
    };

    @IsNotEmpty()
    @IsEnum(["OrderConfirmed", "OrderShipped"])
    storeServiceCaclsType: "OrderConfirmed" | "OrderShipped";

    @IsNumber()
    @IsNotEmpty()
    storeServicePrecentageFee: number;

    @IsNumber()
    @IsNotEmpty()
    companyMaxCartItems:number
    
    @IsNumber()
    @IsNotEmpty()
    storeServicePrecentageProFee: number;

    @IsNumber()
    @IsNotEmpty()
    confirmationServicePrecentageFee: number;

    @IsNumber()
    @IsNotEmpty()
    companyAdvencedShippedOrderConfirmationMemberFee: number;

    @IsNumber()
    @IsNotEmpty()
    confirmedOrderMinFeePrice:number

    @IsNumber()
    @IsNotEmpty()
    shippedOrderMinFeePrice:number


    @IsNumber()
    @IsNotEmpty()
    advencedOrderCalcsConfirmationMinPrice:number

    @Exclude()
    currentConfirmationMemberIdx: number;
}
