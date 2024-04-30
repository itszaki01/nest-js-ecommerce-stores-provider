import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { NoSpecialCharacters } from "src/common/validators/no-special-characters.validator";

export class CreateStoreDto {
    @IsString()
    @MaxLength(20)
    @IsNotEmpty()
    @NoSpecialCharacters()
    storeSubDomain: string;

    @IsNotEmpty()
    @IsEmail()
    userEmail: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    userName: string;

    @IsString()
    @MaxLength(10,{message:'رقم الهاتف غير صحيح'})
    @MinLength(10,{message:'رقم الهاتف غير صحيح'})
    @IsNotEmpty()
    userPhoneNumber: string;

    @IsString()
    @IsNotEmpty()
    twoFactoryLoginCode: string;

    @IsNotEmpty()
    @IsEnum(["basic", "pro"])
    storeSubcreption: "basic" | "pro";

    @IsOptional()
    @IsString()
    apiKey1?: string;

    @IsOptional()
    @IsString()
    apiKey2?: string;

    @IsOptional()
    @IsString()
    apiKey3?: string;

    @IsOptional()
    @IsString()
    apiKey4?: string;

    @IsOptional()
    @IsString()
    apiKey5?: string;

    @IsNotEmpty()
    @MinLength(8, { message: "كلمة السر يجب أن لاتقل على 8 أحرف" })
    password?: string;
}
