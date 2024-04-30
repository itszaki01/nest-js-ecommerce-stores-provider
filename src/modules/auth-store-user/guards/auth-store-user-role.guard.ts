import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class AuthStoreUserRoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const allowTo = this.reflector.getAllAndOverride<"StoreAdmin" | "StoreManager" | "StoreCallMember" |  "StoreAccountent" | "all">("roles", [
            context.getHandler(),
            context.getClass(),
        ]);

        if (allowTo.includes("all")) return true;

        const userRole = context.switchToHttp().getRequest().storeUser.role;
        if (!allowTo.includes(userRole)) throw new UnauthorizedException("ليس لديك الصلاحيات لهذا الأمر");

        return true;
    }
}
