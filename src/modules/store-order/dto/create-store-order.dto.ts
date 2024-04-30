import { Exclude } from "class-transformer";
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from "class-validator";

export class CreateStoreOrderDto {

    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsString()
    @IsOptional()
    locationId:string

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    productPrice: number;

    @IsNumber()
    @IsNotEmpty()
    totalPrice: number;

    @IsNumber()
    @IsOptional()
    shippingPrice: number;

    @IsNumber()
    @IsNotEmpty()
    fakeShippingPrice: number;

    @IsString()
    clientLocation: string;

    @IsString()
    @IsOptional()
    clientAddress: string;

    @IsString()
    @MaxLength(10)
    @MinLength(10)
    @IsNotEmpty()
    clientPhoneNumber: string;

    @IsString()
    @IsNotEmpty()
    productSku:string

    @IsOptional()
    @IsString()
    properties: string;

    @IsString()
    clientName: string;

    @IsNumber()
    totalProductFees: number;

    @IsNotEmpty()
    @IsEnum(["للمنزل", "للمكتب", "مجاني"])
    shippingType: "للمنزل" | "للمكتب" | "مجاني";

    @IsNumber()
    productFees: number;

    @IsNotEmpty()
    @IsString()
    productShortName: string;

    @IsString()
    porductCategory: string;

    @IsMongoId()
    @IsNotEmpty()
    productId: string;

    @IsNotEmpty()
    @IsUUID()
    orderUID?: string;

    @IsString()
    note: string;

    @IsNotEmpty()
    @IsEnum(["جديد", "متروك", "محاولة 1", "محاولة 2", "محاولة 3", "مأكد", "ملغي", "قيد التوصيل", "مستلم", "مسترجع"])
    orderStatus: "جديد" | "متروك" | "محاولة 1" | "محاولة 2" | "محاولة 3" | "مأكد" | "ملغي" | "قيد التوصيل" | "مستلم" | "مسترجع";

    @Exclude()
    isInDelivery:boolean

    @Exclude()
    isShipped:boolean


}
