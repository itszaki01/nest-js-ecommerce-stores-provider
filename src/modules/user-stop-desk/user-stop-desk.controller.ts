import { Controller, Get, Post, Body, Patch, Param, Query, Put, UseInterceptors, ClassSerializerInterceptor } from "@nestjs/common";
import { UserStopDeskService } from "./user-stop-desk.service";
import { CreateUserStopDeskDto } from "./dto/create-user-stop-desk.dto";
import { UpdateUserStopDeskDto } from "./dto/update-user-stop-desk.dto";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { UserCompanyAuth } from "../auth-company-user/decorator/user-company-auth.decorator";
import { CompanyUser } from "../auth-company-user/decorator/company-user.decorator";
import { LogsCompanyService } from "../logs-company/logs-company.service";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { AuthResponseDto } from "src/common/dto/auth-response.dto";
import { UserCompany } from "../user-company/schema/user-company.schema";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@UserCompanyAuth("CompanyOwner", "CompanyManager")
@UseInterceptors(ClassSerializerInterceptor)
@Controller("user-stop-desk")
export class UserStopDeskController {
    constructor(
        private readonly userStopDeskService: UserStopDeskService,
        private readonly logsCompanyService: LogsCompanyService,
        private readonly twoFactoryService: TwoFactoryService
    ) {}

    @Post()
    async create(
        @Body() createUserStopDeskDto: CreateUserStopDeskDto,
        @CompanyUser() userCompany: Readonly<UserCompany>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
        //2:Validate two factory
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(userCompany.twoFactorySecretCode, twoFactoryCode);
        }

        //2:Create The Desk
        const desk = await this.userStopDeskService.create(createUserStopDeskDto);

        //3:Log Action
        this.logsCompanyService.createUserCompanyActionLog(
            userCompany._id as string,
            "إنشاء",
            `تم إنشاء المكتب ${desk.stopDeskName} بواسطة ${userCompany.name}`,
            userCompany.name
        );

        return new AuthResponseDto(desk);
    }

    @UserCompanyAuth("CompanyOwner", "CompanyManager", "CopmanyAccountant")
    @Get()
    async findAll(@Query() queryObject: TQueryParams) {
        const data = await this.userStopDeskService.findAll(queryObject);
        return new AuthResponseDto(data);
    }

    @UserCompanyAuth("CompanyOwner", "CopmanyAccountant",'CompanyManager')
    @Get(":stopDeskId")
    async findOne(@Param("stopDeskId", ParseMongoIdPipe) stopDeskId: string) {
        const stopDesk = await this.userStopDeskService.findOne(stopDeskId);
        return new AuthResponseDto(stopDesk);
    }

    @Patch(":stopDeskId")
    async update(
        @Param("stopDeskId", ParseMongoIdPipe) stopDeskId: string,
        @Body() updateUserStopDeskDto: UpdateUserStopDeskDto,
        @CompanyUser() userCompany: Readonly<UserCompany>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
        //2:Validate two factory
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(userCompany.twoFactorySecretCode, twoFactoryCode);
        }

        //2:Get Old and Update The Desk
        const desk = await this.userStopDeskService.findOne(stopDeskId);
        const updatedDesk = await this.userStopDeskService.update(stopDeskId, updateUserStopDeskDto);

        //3: Logs
        if (desk.email != updatedDesk.email) {
            await this.logsCompanyService.createUserCompanyActionLog(
                userCompany._id as string,
                "تحديث",
                `تم تحديث إيميل المكتب ${desk.email} إلى ===> ${updatedDesk.email} بواسطة ${userCompany.name}`,
                userCompany.name
            );
        }

        if (desk.stopDeskName != updatedDesk.stopDeskName) {
            await this.logsCompanyService.createUserCompanyActionLog(
                userCompany._id as string,
                "تحديث",
                `تم تحديث إسم المكتب ${desk.stopDeskName} إلى ===> ${updatedDesk.stopDeskName} بواسطة ${userCompany.name}`,
                userCompany.name
            );
        }

        if (desk.stopDeskPhoneNumber1 != updatedDesk.stopDeskPhoneNumber1) {
            await this.logsCompanyService.createUserCompanyActionLog(
                userCompany._id as string,
                "تحديث",
                `تم تحديث رقم الهاتف الأول للمكتب ${desk.stopDeskName} من ${desk.stopDeskPhoneNumber1} إلى ===> ${updatedDesk.stopDeskPhoneNumber1} بواسطة ${userCompany.name}`,
                userCompany.name
            );
        }

        if (desk.stopDeskPhoneNumber2 != updatedDesk.stopDeskPhoneNumber2) {
            await this.logsCompanyService.createUserCompanyActionLog(
                userCompany._id as string,
                "تحديث",
                `تم تحديث رقم الهاتف الثاني للمكتب ${desk.stopDeskName} من ${desk.stopDeskPhoneNumber2} إلى ===> ${updatedDesk.stopDeskPhoneNumber2} بواسطة ${userCompany.name}`,
                userCompany.name
            );
        }

        return new AuthResponseDto(desk);
    }

    @Put(":stopDeskId")
    async unActivateDesk(
        @Param("stopDeskId", ParseMongoIdPipe) stopDeskId: string,
        @CompanyUser() userCompany: Readonly<UserCompany>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
        //2:Validate two factory
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(userCompany.twoFactorySecretCode, twoFactoryCode);
        }

        //2:Desactivate The Desk
        const desk = await this.userStopDeskService.unActivateStopDesk(stopDeskId);

        //3:Log Action
        if (desk.isActive) {
            this.logsCompanyService.createUserCompanyActionLog(
                userCompany._id as string,
                "تفعيل",
                `تم تنشيط المكتب ${desk.stopDeskName} بواسطة ${userCompany.name}`,
                userCompany.name
            );
        } else {
            this.logsCompanyService.createUserCompanyActionLog(
                userCompany._id as string,
                "إلغاء",
                `تم إلغاء تنشيط المكتب ${desk.stopDeskName} بواسطة ${userCompany.name}`,
                userCompany.name
            );
        }

        return new AuthResponseDto(desk);
    }
}
