import { Controller, Post, Body, UseInterceptors, ClassSerializerInterceptor } from "@nestjs/common";
import { AuthCompanyUserService } from "./auth-company-user.service";
import { SignInCompanyUserDto } from "./dto/sign-in-company-user.dto";
import { SignUpCompanyUserDto } from "./dto/sign-up-company-user.dto";
import { AuthResponseDto } from "../../common/dto/auth-response.dto";

@Controller("auth-company-user/auth")
@UseInterceptors(ClassSerializerInterceptor)
export class AuthCompanyUserController {
    constructor(private readonly authCompanyUserService: AuthCompanyUserService) {}

    @Post("signin")
    async singIn(@Body() signInCompanyUserDto: SignInCompanyUserDto) {
        const companyUser = await this.authCompanyUserService.signIn(signInCompanyUserDto);
        return new AuthResponseDto(companyUser);
    }

    @Post("signup")
    async signUp(@Body() signUpCompanyUserDto: SignUpCompanyUserDto) {
        const compnayUser = await this.authCompanyUserService.signUp(signUpCompanyUserDto);
        return new AuthResponseDto(compnayUser);
    }
}
