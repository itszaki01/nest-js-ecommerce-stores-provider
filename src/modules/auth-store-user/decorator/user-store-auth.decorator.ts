import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { AuthStoreUserGuard } from "../guards/auth-store-user.guard";
import { AuthStoreUserRoleGuard } from "../guards/auth-store-user-role.guard";

type Roles = "StoreAdmin" | "StoreManager" | "StoreCallMember" | "StoreAccountent";
export const UserStoreAuth = (...roles: Roles[] | "all"[]) => {
    return applyDecorators(SetMetadata("roles", roles), UseGuards(AuthStoreUserGuard, AuthStoreUserRoleGuard));
};
