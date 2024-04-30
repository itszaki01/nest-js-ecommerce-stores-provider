import { PartialType } from "@nestjs/mapped-types";
import { CreateUserStopDeskDto } from "./create-user-stop-desk.dto";
import { Exclude } from "class-transformer";

export class UpdateUserStopDeskDto extends PartialType(CreateUserStopDeskDto) {
    @Exclude()
    passwordChangedAt?: Date;

    @Exclude()
    twoFactorySecretCode: string;

    @Exclude()
    twoFactoryQr: string;
}
