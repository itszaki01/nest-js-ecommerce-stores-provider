import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserStoreDto {
    @IsString()
    @MaxLength(30)
    @IsNotEmpty()
    userName: string;

    @IsEmail()
    @MaxLength(100)
    @IsNotEmpty()
    email: string;

    @IsString()
    @MaxLength(30)
    @MinLength(8, { message: "يحب أن تكون كلمة السر أكبر من 8 حرف" })
    @IsNotEmpty({ message: "كلمة السر مطلوبة" })
    password: string;

    @IsString()
    @MaxLength(10)
    userPhoneNumber: string;

    @IsMongoId()
    @IsOptional()
    stopDesk?: string;

    @IsNotEmpty()
    @IsEnum(["StoreAdmin", "StoreManager", "StoreCallMember", "StoreAccountent"])
    role?: "StoreAdmin" | "StoreManager" | "StoreCallMember" | "StoreAccountent";

    isRoot?: boolean;

    passwordChangedAt?: Date;
}
