import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { UserStoreResetPasswordDto } from "./dto/user-store-reset-password.dto";
import { MailService } from "src/common/services/mail.service";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { UserStoreService } from "./user-store.service";
import { BcryptService } from "src/common/services/bcrypt.service";

@Controller("user-reset-password")
export class UserStorePublicController {
    constructor(
        private readonly mailService: MailService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly userStoreService: UserStoreService,
        private readonly bcrypyService: BcryptService
    ) {}

    @Post()
    create(@Body() userStoreResetPasswordDto: UserStoreResetPasswordDto) {
        return this.mailService.sendResetPasswordEmail(userStoreResetPasswordDto.email);
    }
    @Post("reset")
    async resetPassword(@Body() { password, token }: { password: string; token: string }) {
        try {
            //1:validate password
            if (password.length < 8) {
                throw new BadRequestException("يجب أن تكون كلمة المرور أكبر من 8 حروف");
            }

            //2: Get User
            const user = this.jwtTokenService.verifyJWT(token, EnviromentsClass.JWT_AFFLITA_USER_STORE_SECRET);

            //3: hash password & update password ChangedAt
            const hashedPassword = await this.bcrypyService.hash(password);
            this.userStoreService.update(user.userId, { password: hashedPassword, passwordChangedAt: new Date(Date.now()) });

            return { message: "password changed successfuly" };
        } catch (error) {
            const _error = error as Error;
            if (_error.message.includes("exp")) {
                throw new BadRequestException("إنتهت صلاحية الرابط الرجاء إنشاء طلب جديد لتحديث كلمة المرور");
            } else {
                throw new BadRequestException(_error.message);
            }
        }
    }
}
