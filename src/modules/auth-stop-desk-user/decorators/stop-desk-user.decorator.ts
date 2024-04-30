import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserStopDesk } from "src/modules/user-stop-desk/schema/user-stop-desk.schema";

export const StopDeskUser = createParamDecorator((data: "userId" | "token" | keyof UserStopDesk, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.stopDeskUser[data] : request.stopDeskUser;
});
