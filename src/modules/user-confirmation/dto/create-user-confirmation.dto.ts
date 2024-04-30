import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserConfirmationDto {
    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    userPhoneNumber: string;

    @IsOptional()
    @IsString()
    ccpAccount: string;

    @IsOptional()
    @IsString()
    baridiMobAccount: string;

    @IsOptional()
    @IsBoolean()
    allowMonthlyPayment?: boolean;

    @IsOptional()
    @IsNumber()
    mothlyPaymentAmount?: number;

    @IsOptional()
    @IsDateString()
    monthlyPaymentDate?: Date;
}
