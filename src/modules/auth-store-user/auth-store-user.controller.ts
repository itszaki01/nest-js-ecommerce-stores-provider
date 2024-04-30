import { Controller, Post, Body } from "@nestjs/common";
import { AuthStoreUserService } from "./auth-store-user.service";
import { SignInStoreUserDto } from "./dto/sign-in-store-user.dto";

@Controller("auth-store-user/auth")
export class AuthStoreUserController {
    constructor(private readonly authStoreUserService: AuthStoreUserService) {}

    @Post("signin")
    async signIn(@Body() signInStoreUserDto: SignInStoreUserDto) {
        return this.authStoreUserService.signIn(signInStoreUserDto);
    }
}
