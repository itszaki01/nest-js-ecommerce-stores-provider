import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { UserStopDeskService } from "src/modules/user-stop-desk/user-stop-desk.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import parseMongoJSON from "src/utils/parseMongoJSON";

@Injectable()
export class AuthStopDeskGuard implements CanActivate {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly userStopDeskService: UserStopDeskService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> | Promise<boolean> {
        //1: Get Requset Token
        const req = context.switchToHttp().getRequest() as FastifyRequest & { stopDeskUser: any };
        const token = req.headers["x-afflita-jwt"] as string;
        if (!token) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_AR);
        }

        //2: Verify Owner Token
        const decoded = this.jwtTokenService.verifyJWT(token, EnviromentsClass.JWT_AFFLITA_USER_STOPDESK_SECRET);

        //3: Check if Stop Desk is Exist
        const stopDeskAccount = await this.userStopDeskService.findOneByPayload({ _id: decoded.userId }, ErrorMessages.UNAUTHORIZED_AR);

        //4: Check if Password changed
        if (stopDeskAccount.passwordChangedAt.getTime() < decoded.init * 60) {
            throw new UnauthorizedException(ErrorMessages.PASSWORD_CHANGED);
        }

        //5: Check if Stop Desk User isActive
        if (!stopDeskAccount.isActive) {
            throw new UnauthorizedException("حساب المكتب غير مفعل");
        }

        //5: Assaign stopDesk UserId to requset Object
        
        req.stopDeskUser = { userId: stopDeskAccount._id.toString(), token,...parseMongoJSON(stopDeskAccount) };

        //5: If Pass Test Reeturn True
        return true;
    }
}
