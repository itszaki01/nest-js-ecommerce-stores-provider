import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { AuthCompanyUserGuard } from "../guards/auth-company-user.guard";
import { AuthCompanyUserRoleGuard } from "../guards/auth-company-user-role.guard";

type Roles = 'CompanyOwner'|'CompanyManager' | 'CopmanyAccountant' ;
export const UserCompanyAuth = (...roles: Roles[] | "all"[]) => {
    return applyDecorators(SetMetadata("roles", roles), UseGuards(AuthCompanyUserGuard, AuthCompanyUserRoleGuard));
};
