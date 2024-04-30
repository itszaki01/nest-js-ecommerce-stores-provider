import { IsString, MaxLength, IsNotEmpty, IsEmail, MinLength } from "class-validator";
import { NoSpecialCharacters } from "src/common/validators/no-special-characters.validator";

export class CreateStoreSubDto {
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
    @MaxLength(10, { message: "رقم الهاتف غير صحيح" })
    @MinLength(10, { message: "رقم الهاتف غير صحيح" })
    @IsNotEmpty()
    userPhoneNumber: string;

    @IsNotEmpty()
    @MinLength(8, { message: "كلمة السر يجب أن لاتقل على 8 أحرف" })
    password: string;
}
