import { PartialType } from "@nestjs/mapped-types";
import { CreateUserStoreDto } from "./create-user-store.dto";
import { Exclude } from "class-transformer";

export class UpdateUserStoreDto extends PartialType(CreateUserStoreDto) {
    @Exclude()
    password?: string | undefined;

}
