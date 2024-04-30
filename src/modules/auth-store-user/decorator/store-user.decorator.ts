import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserStore } from "src/modules/user-store/schema/user-store.schema";
type TStoreUser = { userId: string; role: "StoreAdmin" | "StoreManager" | "StoreCallMember" | "StoreAccountent"; storeId: string };
export const StoreUser = createParamDecorator((data: "userId" | "role" | "storeId" | keyof UserStore, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.storeUser?.[data] : (request.storeUser as TStoreUser);
});
