import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInStopDeskUserDto } from "./dto/sign-in-stop-desk-user.dto";
import { UserStopDeskService } from "../user-stop-desk/user-stop-desk.service";
import { BcryptService } from "src/common/services/bcrypt.service";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import parseMongoJSON from "src/utils/parseMongoJSON";

@Injectable()
export class AuthStopDeskUserService {
    constructor(
        private readonly userStopDeskService: UserStopDeskService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly bcryptService: BcryptService,
        private readonly twoFactoryService: TwoFactoryService
    ) {}

    async signIn(signInStopDeskUserDto: SignInStopDeskUserDto) {
        //1: Check if User is Exist
        const stopDeskUser = await this.userStopDeskService.findOneByEmail(signInStopDeskUserDto.email);

        //2:check if stopDesk is Active
        if (!stopDeskUser.isActive) {
            throw new UnauthorizedException("المكتب غير مفعل");
        }

        //3: Validate 2FA
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(stopDeskUser.twoFactorySecretCode, signInStopDeskUserDto.twoFactoryLoginCode);
        }

        //4: Compare Password
        await this.bcryptService.compare(signInStopDeskUserDto.password, stopDeskUser.password);

        //5:Generate Token
        const token = this.jwtTokenService.signJWT({ userId: stopDeskUser._id.toString() }, EnviromentsClass.JWT_AFFLITA_USER_STOPDESK_SECRET);

        //6:Response

        return {
            ...parseMongoJSON(stopDeskUser),
            token,
        };
    }
}
