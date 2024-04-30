import {  Module } from "@nestjs/common";
import { UserCompanyService } from "./user-company.service";
import { UserCompanyController } from "./user-company.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { UserCompany, UserCompanySchema } from "./schema/user-company.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: UserCompany.name, schema: UserCompanySchema }])],
    controllers: [UserCompanyController],
    providers: [UserCompanyService],
    exports:[UserCompanyService]
})
export class UserCompanyModule {}
