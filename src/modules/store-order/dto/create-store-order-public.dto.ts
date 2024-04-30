import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from "class-validator";

export class CreateStoreOrderPublicDto {
    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    quantity: number;

    @IsString()
    @IsOptional()
    locationId:string

    @IsString()
    @IsOptional()
    productSlug:string

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    productPrice: number;

    @IsNumber()
    @IsOptional()
    totalPrice: number;

    @IsBoolean()
    @IsOptional()
    isFromCart:boolean
    
    @IsString()
    @IsUUID()
    @IsOptional()
    cartUID:string
    
    @IsBoolean()
    @IsOptional()
    isCartMainOrder:boolean
    
    @IsNumber()
    @IsOptional()
    cartTotalPrice: number;

    @IsNumber()
    @IsOptional()
    shippingPrice: number;

    @IsNumber()
    @IsNotEmpty()
    fakeShippingPrice: number;

    @IsOptional()
    @IsString()
    clientLocation: string;

    @IsOptional()
    @IsString()
    clientAddress: string;

    @IsString()
    @MaxLength(10)
    @MinLength(10)
    @IsNotEmpty()
    clientPhoneNumber: string;

    @IsString()
    @IsNotEmpty()
    productSku: string;

    @IsArray()
    @IsOptional()
    properties: string[];

    @IsString()
    @IsOptional()
    clientName: string;

    @IsNumber()
    @IsOptional()
    totalProductFees: number;

    @IsNotEmpty()
    @IsEnum(["للمنزل", "للمكتب", "مجاني"])
    shippingType: "للمنزل" | "للمكتب" | "مجاني";

    @IsNumber()
    @IsOptional()
    productFees: number;

    @IsNotEmpty()
    @IsString()
    productShortName: string;

    @IsMongoId()
    @IsNotEmpty()
    productId: string;

    @IsNotEmpty()
    @IsEnum(["جديد", "متروك"])
    orderStatus: "جديد" | "متروك";

    @IsNotEmpty()
    @IsUUID()
    orderUID?: string;

    @IsString()
    @IsOptional()
    porductCategory: string;
}
