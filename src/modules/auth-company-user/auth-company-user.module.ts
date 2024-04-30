import { Module } from "@nestjs/common";
import { AuthCompanyUserService } from "./auth-company-user.service";
import { AuthCompanyUserController } from "./auth-company-user.controller";
import { UserCompanyModule } from "../user-company/user-company.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserCompany, UserCompanySchema } from "../user-company/schema/user-company.schema";

@Module({
    imports: [UserCompanyModule, MongooseModule.forFeature([{ name: UserCompany.name, schema: UserCompanySchema }])],
    controllers: [AuthCompanyUserController],
    providers: [AuthCompanyUserService],
})
export class AuthCompanyUserModule {}
