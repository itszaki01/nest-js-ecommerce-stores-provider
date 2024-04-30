import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { UserConfirmationService } from "src/modules/user-confirmation/user-confirmation.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import parseMongoJSON from "src/utils/parseMongoJSON";

@Injectable()
export class AuthUserConfirmationGuard implements CanActivate {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly userConfirmationService: UserConfirmationService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> | Promise<boolean> {
        //1: Get Requset Token
        const req = context.switchToHttp().getRequest() as FastifyRequest & { confirmationUser: any };
        const token = req.headers["x-afflita-jwt"] as string;
        if (!token) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_AR);
        }

        //2: Verify Confirmation User Token
        const decoded = this.jwtTokenService.verifyJWT(token, EnviromentsClass.JWT_AFFLITA_USER_CONFIRMATION_SECRET);

        //3: Check if Confirmation User is Exist
        const userCompanyAccount = await this.userConfirmationService.findOneByPayload({ _id: decoded.userId }, ErrorMessages.UNAUTHORIZED_AR);

        //4: Check if Password changed
        if (userCompanyAccount.passwordChangedAt.getTime() < decoded.init * 60) {
            throw new UnauthorizedException(ErrorMessages.PASSWORD_CHANGED);
        }

        //5: Check if Confirmation User User isActive
        if (!userCompanyAccount.isActive) {
            throw new UnauthorizedException("حساب العضوية غير مفعل");
        }

        //5: Assaign stopDesk UserId to requset Object
        
        req.confirmationUser = { userId: userCompanyAccount._id.toString(), token,...parseMongoJSON(userCompanyAccount) };

        //5: If Pass Test Reeturn True
        return true;
    }
}
