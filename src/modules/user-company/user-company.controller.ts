import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, Query } from "@nestjs/common";
import { UserCompanyService } from "./user-company.service";
import { CreateUserCompanyDto } from "./dto/create-user-company.dto";
import { UpdateUserCompanyDto } from "./dto/update-user-company.dto";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { UserCompanyAuth } from "../auth-company-user/decorator/user-company-auth.decorator";
import { AuthResponseDto } from "src/common/dto/auth-response.dto";
import { TQueryParams } from "src/@types/QueryParams.type";
import { SkipThrottle } from "@nestjs/throttler";


@SkipThrottle()
@UserCompanyAuth("CompanyOwner")
@UseInterceptors(ClassSerializerInterceptor)
@Controller("user-company")
export class UserCompanyController {
    constructor(private readonly userCompanyUserService: UserCompanyService) {}

    @Post()
    async create(@Body() createUserCompanyDto: CreateUserCompanyDto) {
        const userCompany = await this.userCompanyUserService.create(createUserCompanyDto);
        return new AuthResponseDto(userCompany);
    }

    @Get()
    findAll(@Query() queryParams: TQueryParams) {
        return this.userCompanyUserService.findAll(queryParams);
    }

    @Get(":companyUserId")
    async findOne(@Param("companyUserId", ParseMongoIdPipe) companyUserId: string) {
        const userCompany = await this.userCompanyUserService.findOne(companyUserId);
        return new AuthResponseDto(userCompany);
    }

    @Patch(":companyUserId")
    async update(@Param("companyUserId", ParseMongoIdPipe) companyUserId: string, @Body() updateUserCompanyDto: UpdateUserCompanyDto) {
        const userCompany = await this.userCompanyUserService.update(companyUserId, updateUserCompanyDto);
        return new AuthResponseDto(userCompany);
    }

    @Delete(":companyUserId")
    async remove(@Param("companyUserId", ParseMongoIdPipe) companyUserId: string) {
        const userCompany = await this.userCompanyUserService.remove(companyUserId);
        return new AuthResponseDto(userCompany);
    }
}
