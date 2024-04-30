import { IsString, MaxLength, IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class CreateUserStopDeskDto {
    @IsString()
    @MaxLength(30)
    @IsNotEmpty()
    stopDeskName: string;

    @IsEmail()
    @MaxLength(100)
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    stopDeskPhoneNumber1?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    stopDeskPhoneNumber2?: string;

    isActive?:boolean

    passwordChangedAt?: Date;

    twoFactorySecretCode: string;

    totalUnPaidStoresNumber?: number;

    totalUnPaidStoresPayments?: number;

    twoFactoryQr: string;
    
    _id?:string

}
