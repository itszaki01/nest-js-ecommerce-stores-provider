import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseInterceptors,
    ClassSerializerInterceptor,
    Put,
    BadRequestException,
} from "@nestjs/common";
import { UserConfirmationService } from "./user-confirmation.service";
import { CreateUserConfirmationDto } from "./dto/create-user-confirmation.dto";
import { UpdateUserConfirmationDto } from "./dto/update-user-confirmation.dto";
import { UserCompanyAuth } from "../auth-company-user/decorator/user-company-auth.decorator";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { LogsCompanyService } from "../logs-company/logs-company.service";
import { CompanyUser } from "../auth-company-user/decorator/company-user.decorator";
import { UserCompany } from "../user-company/schema/user-company.schema";
import { AuthResponseDto } from "src/common/dto/auth-response.dto";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { LogsUserConfirmationService } from "../logs-user-confirmation/logs-user-confirmation.service";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@UserCompanyAuth("CompanyOwner", "CompanyManager")
@UseInterceptors(ClassSerializerInterceptor)
@Controller("user-confirmation")
export class UserConfirmationController {
    constructor(
        private readonly userConfirmationService: UserConfirmationService,
        private readonly logsCompanyService: LogsCompanyService,
        private readonly twoFactoryService: TwoFactoryService,
        private readonly logsUserConfirmationService: LogsUserConfirmationService,
    ) {}

    @Post()
    async create(
        @Body() createUserConfirmationDto: CreateUserConfirmationDto,
        @CompanyUser() companyUser: Readonly<UserCompany>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
        //2:Validate two factory
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(companyUser.twoFactorySecretCode, twoFactoryCode);
        }
        //1:Create the user
        const user = await this.userConfirmationService.create(createUserConfirmationDto);

        //2: Log the actoin
        this.logsCompanyService.createUserCompanyActionLog(
            companyUser._id as string,
            "إنشاء",
            `تم إنشاء حساب عضو تأكيد الطلبات ${createUserConfirmationDto.userName} بواسطة ${companyUser.name}`,
            companyUser.name
        );
        return new AuthResponseDto(user);
    }

    @UserCompanyAuth('CompanyOwner','CompanyManager')
    @Get('status-users-confirmation')
    async findAllWithStatus(@Query() queryParmas: TQueryParams) {
        const users = await this.userConfirmationService.findAllWithStatus(queryParmas);
        return new AuthResponseDto(users);
    }

    @UserCompanyAuth('all')
    @Get()
    async findAll(@Query() queryParmas: TQueryParams) {
        const users = await this.userConfirmationService.findAll(queryParmas);
        return new AuthResponseDto(users);
    }

    @UserCompanyAuth('all')
    @Get("get-user-by-email/:userEmail")
    async findOneByEmail(@Param("userEmail") userEmail: string) {
        const user = await this.userConfirmationService.findOneByEmail(userEmail);
        return new AuthResponseDto(user);
    }

    @UserCompanyAuth('all')
    @Get("get-user-by-phone/:userPhone")
    async findOneByPhone(@Param("userPhone") userPhone: string) {
        const user = await this.userConfirmationService.findOneByPhone(userPhone);
        return new AuthResponseDto(user);
    }

    @UserCompanyAuth('all')
    @Get(":userConfirmationId")
    async findOne(@Param("userConfirmationId", ParseMongoIdPipe) userConfirmationId: string) {
        const user = await this.userConfirmationService.findOne(userConfirmationId);
        return new AuthResponseDto(user);
    }

    @Patch(":userConfirmationId")
    async update(
        @Param("userConfirmationId", ParseMongoIdPipe) userConfirmationId: string,
        @Body() updateUserConfirmationDto: UpdateUserConfirmationDto,
        @CompanyUser() companyUser: Readonly<UserCompany>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
        //1: Get User Before Edit
        const user = await this.userConfirmationService.findOne(userConfirmationId);

        //2:Validate two factory
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(companyUser.twoFactorySecretCode, twoFactoryCode);
        }

        //2: Update User
        const updatedUser = await this.userConfirmationService.update(userConfirmationId, updateUserConfirmationDto);

        //3: Log The Action
        if (user.userName != updatedUser.userName) {
            await this.logsCompanyService.createUserCompanyActionLog(
                companyUser._id as string,
                "تحديث",
                `تم تغيير إسم عضو تأكيد الطلبات ${user.userName} من ${user.userName} إلى ===> ${updatedUser.userName} - بواسطة ${companyUser.name}`,
                companyUser.name
            );
        }

        if (user.email != updatedUser.email) {
            await this.logsCompanyService.createUserCompanyActionLog(
                companyUser._id as string,
                "تحديث",
                `تم تغيير إيميل عضو تأكيد الطلبات ${updatedUser.userName} من ${user.email} إلى ===> ${updatedUser.email} - بواسطة ${companyUser.name}`,
                companyUser.name
            );
        }

        if (updatedUser.ccpAccount && user.ccpAccount != updatedUser.ccpAccount) {
            await this.logsCompanyService.createUserCompanyActionLog(
                companyUser._id as string,
                "تحديث",
                `تم تغيير ccp الخاص ب عضو تأكيد الطلبات ${updatedUser.userName} من ${user.ccpAccount} إلى ===> ${updatedUser.ccpAccount} - بواسطة ${companyUser.name}`,
                companyUser.name
            );
        }

        if (user.userPhoneNumber != updatedUser.userPhoneNumber) {
            await this.logsCompanyService.createUserCompanyActionLog(
                companyUser._id as string,
                "تحديث",
                `تم تغيير رقم هاتف عضو تأكيد الطلبات ${updatedUser.userName} من ${user.userPhoneNumber} إلى ===> ${updatedUser.userPhoneNumber} - بواسطة ${companyUser.name}`,
                companyUser.name
            );
        }

        if (updatedUser.baridiMobAccount && user.baridiMobAccount != updatedUser.baridiMobAccount) {
            await this.logsCompanyService.createUserCompanyActionLog(
                companyUser._id as string,
                "تحديث",
                `تم تغيير Baridi Mob عضو تأكيد الطلبات ${updatedUser.userName} من ${user.baridiMobAccount} إلى ===> ${updatedUser.baridiMobAccount} - بواسطة ${companyUser.name}`,
                companyUser.name
            );
        }
        return new AuthResponseDto(updatedUser);
    }

    @UserCompanyAuth('CompanyOwner','CopmanyAccountant')
    @Post("clear-calcs/:userConfirmationId")
    async clearUserConfirmationCalcs(@Param("userConfirmationId") userConfirmationId: string, @CompanyUser() userCompany: Readonly<UserCompany>) {
        //1: Get user before clear calcs
        const user = await this.userConfirmationService.findOne(userConfirmationId);
        if (!user.allowMonthlyPayment && user.totalProfit < 1) {
            throw new BadRequestException("حساب العضو 0");
        }

        //2: Clear Calcs
        const clearedCalcsUser = await this.userConfirmationService.clearUserConfirmationCalcs(userConfirmationId);

        //3: Log Response
        if (user.allowMonthlyPayment) {
            await this.logsUserConfirmationService.createCalcsLogUserConfirmation(
                clearedCalcsUser.id as string,
                user.userName,
                `تم دفع راتب العضو ${user.userName} المقدر ب ${user.mothlyPaymentAmount} دج و ${user.totalConfirmedOrders} طلب مأكد -- بواسطة ${userCompany.name}`,
                user.totalProfit || 0
            );
            clearedCalcsUser.monthlyPaymentDate = new Date(Date.now() + 2.628e+6 * 1000)
            await clearedCalcsUser.save()
        } else {
            await this.logsUserConfirmationService.createCalcsLogUserConfirmation(
                clearedCalcsUser.id as string,
                user.userName,
                `تم تصفية حساب العضو ${user.userName} من ${user.totalProfit} دج و ${user.totalConfirmedOrders} طلب مأكد إلى ===> 0 دج و 0 طلب مأكد -- بواسطة ${userCompany.name}`,
                user.totalProfit || 0
            );
        }

        return new AuthResponseDto(clearedCalcsUser);
    }

    @Put(":userConfirmtaionId")
    async unActivateDesk(
        @Param("userConfirmtaionId", ParseMongoIdPipe) userConfirmtaionId: string,
        @CompanyUser() userCompany: Readonly<UserCompany>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
        //2:Validate two factory
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(userCompany.twoFactorySecretCode, twoFactoryCode);
        }

        //2:Desactivate The Desk
        const users = await this.userConfirmationService.unActivateUserConfirmation(userConfirmtaionId);

        //3:Log Action
        if (users.isActive) {
            this.logsCompanyService.createUserCompanyActionLog(
                userCompany._id as string,
                "تفعيل",
                `تم تنشيط حساب عضو تأكيد الطلبات ${users.userName} بواسطة ${userCompany.name}`,
                userCompany.name
            );
        } else {
            this.logsCompanyService.createUserCompanyActionLog(
                userCompany._id as string,
                "إلغاء",
                `تم إلغاء تنشيط حساب عضو تأكيد الطلبات ${users.userName} بواسطة ${userCompany.name}`,
                userCompany.name
            );
        }
        return new AuthResponseDto(users);
    }

    @Delete(":userConfirmationId")
    async remove(
        @Param("userConfirmationId", ParseMongoIdPipe) userConfirmationId: string,
        @CompanyUser() companyUser: Readonly<UserCompany>,
        @Query("twoFactoryCode") twoFactoryCode: string
    ) {
        //0:Validate two factory
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(companyUser.twoFactorySecretCode, twoFactoryCode);
        }

        //1: Remove the user
        const deletedUser = await this.userConfirmationService.remove(userConfirmationId);

        //2: Log the actoin
        this.logsCompanyService.createUserCompanyActionLog(
            companyUser._id as string,
            "حذف",
            `تم حذف حساب عضو تأكيد الطلبات ${deletedUser.userName} بواسطة ${companyUser.name}`,
            companyUser.name
        );
        return new AuthResponseDto(deletedUser);
    }
}
