import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Store } from "../schema/store.schema";
export const StoreObject = createParamDecorator((data: keyof Store, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.store[data] : request.store;
});
