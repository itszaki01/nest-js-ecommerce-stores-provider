import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserConfirmation } from "src/modules/user-confirmation/schema/user-confirmation.schema";

export const ConfirmationUser = createParamDecorator((data: "userId" | "token" | keyof UserConfirmation, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.confirmationUser[data] : request.confirmationUser;
});
