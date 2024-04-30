import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { UserConfirmationService } from "./user-confirmation.service";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { AuthResponseDto } from "src/common/dto/auth-response.dto";
import { AuthUserConfirmationGuard } from "../auth-user-confirmation/guards/auth-confirmation-user.guard";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@UseGuards(AuthUserConfirmationGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller("find-one-user-confirmation")
export class FindOneUserConfirmationController {
    constructor(private readonly userConfirmationService:UserConfirmationService){}

    @Get(":userConfirmationId")
    async findOne(@Param("userConfirmationId", ParseMongoIdPipe) userConfirmationId: string) {
        const user = await this.userConfirmationService.findOne(userConfirmationId);
        return new AuthResponseDto(user);
    }
}
