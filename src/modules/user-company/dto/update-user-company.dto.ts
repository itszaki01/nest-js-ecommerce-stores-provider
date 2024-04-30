import { PartialType } from "@nestjs/mapped-types";
import { CreateUserCompanyDto } from "./create-user-company.dto";
import { Exclude } from "class-transformer";

export class UpdateUserCompanyDto extends PartialType(CreateUserCompanyDto) {
    @Exclude()
    name?: string | undefined;

    @Exclude()
    passwordChangedAt?: Date;

    @Exclude()
    twoFactorySecretCode: string;

    @Exclude()
    twoFactoryQr: string;

    @Exclude()
    password?: string | undefined;
}
