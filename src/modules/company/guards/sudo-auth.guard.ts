import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { ErrorMessages } from "src/constants/ErrorMessage";

@Injectable()
export class SudoAuthGuard implements CanActivate {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> | Promise<boolean> {
        //1: Get Requset Token
        const req = context.switchToHttp().getRequest() as FastifyRequest;
        const token = req.headers["sudo-token"] as string;

        if (!token) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_AR);
        }

        //2: Verify Owner Token
        this.jwtTokenService.verifyJWT(token, "20948@#$@#%!#f@#f@#$rf%@}#fk@#kfp@{p#%kkfv{@#krp@I[PC23MIT[2");

        //5: If Pass Test Reeturn True
        return true;
    }
}
