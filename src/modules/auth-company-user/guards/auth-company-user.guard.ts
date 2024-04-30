import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { UserCompanyService } from "src/modules/user-company/user-company.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import parseMongoJSON from "src/utils/parseMongoJSON";

@Injectable()
export class AuthCompanyUserGuard implements CanActivate {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly userCompanyService: UserCompanyService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        //1: Get Requset Token
        const req = context.switchToHttp().getRequest() as FastifyRequest & { companyUser: any };
        const token = req.headers['x-afflita-jwt'] as string
        if (!token) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_AR);
        }

        //2: Verify CompanyUser Token
        const decoded = this.jwtTokenService.verifyJWT(token,EnviromentsClass.JWT_AFFLITA_USER_COMPANY_SECRET);

        //3: Check if CompanyUser is Exist
        const companyUser = await this.userCompanyService.findOneByPayload({ _id: decoded.userId  }, ErrorMessages.UNAUTHORIZED_AR);

        //4: Check if Password changed
        if (companyUser.passwordChangedAt.getTime() < decoded.init * 60) {
            throw new UnauthorizedException(ErrorMessages.PASSWORD_CHANGED);
        }

        //5: Assaign Company & Role UserId to requset Object
        
        req.companyUser = { userId: companyUser._id.toString(), role: companyUser.role,...parseMongoJSON(companyUser) };

        //5: If Pass Test Reeturn True
        return true;
    }
}
