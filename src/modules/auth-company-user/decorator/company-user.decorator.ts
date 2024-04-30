import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserCompany } from "src/modules/user-company/schema/user-company.schema";
export const CompanyUser = createParamDecorator((data: "userId" | "role" | keyof UserCompany, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.companyUser[data] : request.companyUser;
});
