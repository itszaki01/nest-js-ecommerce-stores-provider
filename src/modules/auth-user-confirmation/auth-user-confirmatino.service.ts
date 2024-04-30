import { Injectable, UnauthorizedException } from "@nestjs/common";
import { BcryptService } from "src/common/services/bcrypt.service";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import parseMongoJSON from "src/utils/parseMongoJSON";
import { SignInCompanyUserDto } from "../auth-company-user/dto/sign-in-company-user.dto";
import { UserConfirmationService } from "../user-confirmation/user-confirmation.service";

@Injectable()
export class AuthUserConfirmationService {
    constructor(
        private readonly userConfrimationService: UserConfirmationService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly bcryptService: BcryptService,
        private readonly twoFactoryService: TwoFactoryService
    ) {}

    async signIn(signInUserConfirmationUserDto: SignInCompanyUserDto) {
        //1: Check if User is Exist
        const userConfirmation = await this.userConfrimationService.findOneByEmail(signInUserConfirmationUserDto.email);

        //2:check if stopDesk is Active
        if (!userConfirmation.isActive) {
            throw new UnauthorizedException("الحساب غير مفعل");
        }

        //3: Validate 2FA
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(userConfirmation.twoFactorySecretCode, signInUserConfirmationUserDto.twoFactoryLoginCode);
        }

        //4: Compare Password
        await this.bcryptService.compare(signInUserConfirmationUserDto.password, userConfirmation.password);

        //5:Generate Token
        const token = this.jwtTokenService.signJWT({ userId: userConfirmation._id.toString() }, EnviromentsClass.JWT_AFFLITA_USER_CONFIRMATION_SECRET);

        //6:Response

        return {
            ...parseMongoJSON(userConfirmation),
            token,
        };
    }
}
