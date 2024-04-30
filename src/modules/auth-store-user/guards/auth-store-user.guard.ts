import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { StoreService } from "src/modules/store/store.service";
import { UserStoreService } from "src/modules/user-store/user-store.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import parseMongoJSON from "src/utils/parseMongoJSON";

@Injectable()
export class AuthStoreUserGuard implements CanActivate {
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly userStoreService: UserStoreService,
        private readonly storeService: StoreService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        //1: Get Requset Token
        const req = context.switchToHttp().getRequest() as FastifyRequest & { storeUser: any; store: any };
        const token = req.headers["x-afflita-jwt"] as string;
        if (!token) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_AR);
        }

        //2: Verify StoreUser Token
        const decoded = this.jwtTokenService.verifyJWT(token, EnviromentsClass.JWT_AFFLITA_USER_STORE_SECRET);

        //3: Check if StoreUser is Exist
        const storeUser = await this.userStoreService.findOneByPayload({ _id: decoded.userId }, ErrorMessages.UNAUTHORIZED_AR);

        //3.1 check if user is Active
        if(!storeUser.isActive) throw new UnauthorizedException('هذا الحساب غير مفعل')
        
        //4: Check if Password changed
        if (storeUser.passwordChangedAt.getTime() < decoded.init * 60) {
            throw new UnauthorizedException(ErrorMessages.PASSWORD_CHANGED);
        }

        //5:check if store is active
        const store = await this.storeService.findOne(storeUser.store);
        if (!store.isActive) {
            throw new UnauthorizedException("المتجر غير مفعل");
        }

        //6: Assaign storeUser UserId to requset Object
        req.storeUser = { userId: storeUser._id.toString(), role: storeUser.role, storeId: storeUser.store.toString(), ...parseMongoJSON(storeUser) };

        //7://assign store to req
        req.store = { ...parseMongoJSON(store) };

        //5: If Pass Test Reeturn True
        return true;
    }
}
