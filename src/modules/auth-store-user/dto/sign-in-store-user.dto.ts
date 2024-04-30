import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class SignInStoreUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MaxLength(30)
    password: string
}
