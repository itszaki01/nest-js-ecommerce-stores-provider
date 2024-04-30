import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { TQueryParams } from "src/@types/QueryParams.type";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { UserCompanyService } from "src/modules/user-company/user-company.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";

@Injectable()
export class AuthCompanyUserGuard implements CanActivate {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly userCompanyUserService: UserCompanyService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> | Promise<boolean> {
        //1: Get Requset Token
        const req = context.switchToHttp().getRequest() as FastifyRequest;
        const token = req.headers["x-afflita-jwt"] as string;

        if (!token) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_AR);
        }

        //2: Verify Owner Token
        const decoded = this.jwtTokenService.verifyJWT(token, EnviromentsClass.JWT_AFFLITA_USER_COMPANY_SECRET);

        //3: Check if Owner Exist
        const ownerAccount = (await this.userCompanyUserService.findAll({} as TQueryParams)).documents[0];
        if (ownerAccount._id.toString() != decoded.userId) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_AR);
        }

        //4: Check if Password changed
        if (ownerAccount.passwordChangedAt.getTime() < decoded.init * 60) {
            throw new UnauthorizedException(ErrorMessages.PASSWORD_CHANGED);
        }

        //5: If Pass Test Reeturn True
        return true;
    }
}
