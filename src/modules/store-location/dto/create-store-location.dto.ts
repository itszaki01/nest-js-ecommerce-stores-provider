import { Exclude } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateStoreLocationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    locationName: string;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    ToHome: boolean;

    @IsNumber()
    @IsNotEmpty()
    shippingToHomePrice: number;

    @IsNumber()
    @IsNotEmpty()
    shippingToHomeFakePrice: number;

    @IsBoolean()
    ToStopDesk: boolean;

    @IsOptional()
    @IsNumber()
    shippingToStopDeskPrice: number;

    @IsOptional()
    @IsNumber()
    shippingToStopDeskFakePrice: number;
    
    @IsOptional()
    @IsString()
    @MaxLength(300)
    StopDeskAddress: string;

    @Exclude()
    locationIndex?: number;

    @Exclude()
    store?: string;
}
