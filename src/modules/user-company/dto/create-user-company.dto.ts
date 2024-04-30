import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserCompanyDto {
    @IsString()
    @MaxLength(30)
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @MaxLength(100)
    @IsNotEmpty()
    email: string;

    @MaxLength(10, { message: "رقم الهاتف خاطئ" })
    @MinLength(10, { message: "رقم الهاتف خاطئ" })
    @IsNotEmpty()
    phoneNumber?: string;

    @IsEnum(["CompanyManager", "CopmanyAccountant"])
    @IsNotEmpty()
    role: "CompanyOwner" | "CompanyManager" | "CopmanyAccountant";

    password?: string;

    passwordChangedAt?: Date;

    twoFactorySecretCode?: string;

    twoFactoryQr?: string;
}
