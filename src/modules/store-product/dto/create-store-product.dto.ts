import { IsArray, IsBoolean, IsHexColor, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateStoreProductDto {
    @IsBoolean()
    showProduct: boolean;

    @IsOptional()
    @IsBoolean()
    allowSpecialGoogleSheet?: boolean;

    @IsOptional()
    @IsBoolean()
    allowSendOrderToAllSheets?: boolean;

    @IsOptional()
    @IsBoolean()
    disableAddToShoppingCart?: boolean;

    @IsOptional()
    @IsBoolean()
    disableSuggestedProducts?: boolean;
    @IsOptional()
    @IsNumber()
    remainingQtty?:number

    @IsOptional()
    @IsString()
    specialGoogleSheetsApiKey?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    productShortName: string;

    @IsNumber()
    productFees: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    price: number;

    @IsString()
    @MaxLength(200)
    description: string;

    @IsBoolean()
    freeShipping: boolean;

    @IsBoolean()
    singleShipping: boolean;

    @IsNumber()
    @IsOptional()
    singleShippingPrice: number;

    @IsBoolean()
    landingPage: boolean;

    @IsNotEmpty()
    @IsString()
    productSku: string;

    @IsOptional()
    @IsBoolean()
    landingPageColor: boolean;

    @IsHexColor()
    @IsOptional()
    landingPageColorValue: string;

    @IsObject()
    colors?: {
        multiSelect: boolean;
        list: [
            {
                hex: string;
                colorSku: string;
                name: string;
            },
        ];
    };

    @IsString()
    @IsNotEmpty()
    imageCover: string;

    @IsArray()
    @IsOptional()
    images: [
        {
            imageUrl: string;
        },
    ];

    @IsString()
    @IsOptional()
    category: string;

    @IsArray()
    @IsOptional()
    otherProperties?: [
        {
            title: string;
            multiSelect: boolean;
            properties: [
                {
                    name: string;
                    hasIcon: boolean;
                    propertySku: string;
                    iconUrl: string;
                },
            ];
        },
    ];

    @IsNumber()
    rating: number;

    @IsNumber()
    oldPrice: number;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsArray()
    @IsOptional()
    offers?: [
        {
            offerName: string;
            quanitity: number;
            offerProductPrice: number;
            freeShipping: boolean;
            oldPrice: number;
            bestOffer: boolean;
            defaultSelect: boolean;
        },
    ];

    @IsOptional()
    @IsBoolean()
    allowReviews: boolean;

    @IsArray()
    @IsOptional()
    reviews?: {
        isMale: boolean;
        isFemale: boolean;
        allowRaterProfileImage: boolean;
        raterProfileImage: string;
        raterName: string;
        rating: number;
        review: string;
        imageUrl: string;
    }[];

    @IsString()
    productDesc: string;

    store?: string;
    id?: string;
}
