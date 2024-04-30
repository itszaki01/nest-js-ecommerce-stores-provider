import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { NoSpecialCharacters } from "src/common/validators/no-special-characters.validator";

export class StorePublicSignUpDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    userEmail: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8,{message:'يحب أن لاتقل كلمة السر عن 8 حروف'})
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @NoSpecialCharacters()
    storeSubDomain: string;

    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    userPhoneNumber: string;

    storeSubScription: 'basic' | 'pro'
}
