import { Controller, Post, Body, UseInterceptors, ClassSerializerInterceptor } from "@nestjs/common";
import { AuthResponseDto } from "src/common/dto/auth-response.dto";
import { SignInUserConfirmationDto } from "./dto/sign-in-confirmation-user.dto";
import { UserConfirmation } from "../user-confirmation/schema/user-confirmation.schema";
import { AuthUserConfirmationService } from "./auth-user-confirmatino.service";

@Controller("auth-user-confirmation/auth")
export class AuthUserConfirmationController {
    constructor(private readonly authUserConfirmationService: AuthUserConfirmationService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Post("signin")
    async signIn(@Body() signInUserConfirmationDto: SignInUserConfirmationDto): Promise<AuthResponseDto<UserConfirmation>> {
        const userData = await this.authUserConfirmationService.signIn(signInUserConfirmationDto);
        return new AuthResponseDto(userData);
    }
}
