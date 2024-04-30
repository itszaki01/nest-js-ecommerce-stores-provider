import { Controller, Post, Body, UseInterceptors, ClassSerializerInterceptor } from "@nestjs/common";
import { AuthStopDeskUserService } from "./auth-stop-desk-user.service";
import { SignInStopDeskUserDto } from "./dto/sign-in-stop-desk-user.dto";
import { AuthResponseDto } from "src/common/dto/auth-response.dto";
import { UserStopDesk } from "../user-stop-desk/schema/user-stop-desk.schema";

@Controller("auth-stop-desk-user/auth")
export class AuthStopDeskUserController {
    constructor(private readonly authStopDeskUserService: AuthStopDeskUserService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Post("signin")
    async signIn(@Body() signInStopDeskUserDto: SignInStopDeskUserDto): Promise<AuthResponseDto<UserStopDesk>> {
        const userData = await this.authStopDeskUserService.signIn(signInStopDeskUserDto);
        return new AuthResponseDto(userData);
    }
}
