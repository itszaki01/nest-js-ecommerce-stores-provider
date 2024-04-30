import { BadRequestException, Injectable, NestMiddleware } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";

@Injectable()
export class ValidateCsrfJwtMiddleWare implements NestMiddleware {
    constructor(private readonly jwtTokenService: JwtTokenService) {}
    async use(req: FastifyRequest["raw"], res: FastifyReply, next: () => void) {
        if (EnviromentsClass.NODE_ENV === "DEV") return next();

        const cookies = req.headers["cookie"];
        if (!cookies) throw new BadRequestException();

        const token = cookies
            ?.split(";")
            .filter((item) => item.includes("XSRF-TOKEN"))
            .join()
            .split("=")[1];
        if (!token) {
            throw new BadRequestException();
        }
        try {
            this.jwtTokenService.verifyCsrfJWT(token);
        } catch (error) {
            throw new BadRequestException();
        }

        next();
    }
}
