import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class UserStoreResetPasswordDto {
    @IsEmail()
    @MaxLength(100)
    @IsNotEmpty()
    email: string;
}
