import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class SignInUserConfirmationDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MaxLength(30)
    password: string;

    @IsNotEmpty()
    twoFactoryLoginCode:string
}
