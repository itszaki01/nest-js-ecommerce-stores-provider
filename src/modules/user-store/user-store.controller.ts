import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UnauthorizedException, BadRequestException, Put } from "@nestjs/common";
import { UserStoreService } from "./user-store.service";
import { CreateUserStoreDto } from "./dto/create-user-store.dto";
import { UpdateUserStoreDto } from "./dto/update-user-store.dto";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { InjectModel } from "@nestjs/mongoose";
import { UserStore } from "./schema/user-store.schema";
import { Model } from "mongoose";
import { StoreObject } from "../store/decorator/store-objcet.decorator";
import { Store } from "../store/schema/store.schema";
import { LogsUserStoreService } from "../logs-user-store/logs-user-store.service";

@UserStoreAuth("StoreAdmin")
@Controller("user-store")
export class UserStoreController {
    constructor(
        private readonly userStoreService: UserStoreService,
        private readonly logsUserStoreService: LogsUserStoreService,
        @InjectModel(UserStore.name) private userStoreModel: Model<UserStore>
    ) {}

    @Post()
    async create(@Body() createUserStoreDto: CreateUserStoreDto, @StoreObject() store: Readonly<Store>, @StoreUser() storeUser: Readonly<UserStore>) {
        //1:check if store is pro
        if (store.storeSubcreption != "pro") {
            throw new UnauthorizedException("يجب الإشتراك في باقة PRO لإستعمال هذه المميزات");
        }

        //2:Create the user
        const newUser = await this.userStoreService.create(createUserStoreDto, store._id as string);

        //3:Log the action
        this.logsUserStoreService.createLogUserStore(
            store._id as string,
            storeUser._id as string,
            storeUser.userName,
            `تم إنشاء المستخدم ${createUserStoreDto.userName} بواسطة ${storeUser.userName}`,
            "إنشاء"
        );
        return newUser;
    }

    @UserStoreAuth("StoreAdmin", "StoreAccountent")
    @Get()
    findAll(@Query() queryParmas: TQueryParams, @StoreUser("storeId") storeId: string) {
        return this.userStoreService.findAllByPayload(queryParmas, { store: storeId });
    }

    @UserStoreAuth("all")
    @Get(":storeUserId")
    findOne(@Param("storeUserId", ParseMongoIdPipe) storeUserId: string, @StoreUser("storeId") storeId: string) {
        return this.userStoreService.findOneByPayload({ store: storeId, _id: storeUserId }, "لم يتم العثور على المستخدم");
    }

    @Patch(":storeUserId")
    async update(
        @Param("storeUserId", ParseMongoIdPipe) storeUserId: string,
        @StoreUser() actionUser: Readonly<UserStore>,
        @StoreObject() store: Readonly<Store>,
        @Body() updateUserStoreDto: UpdateUserStoreDto
    ) {
        //1:check if store is pro
        if (store.storeSubcreption != "pro") {
            throw new UnauthorizedException("يجب الإشتراك في باقة PRO لإستعمال هذه المميزات");
        }

        //1:check if user is the root
        const userToUpdate = await this.userStoreService.findOne(storeUserId);
        if (userToUpdate?.isRoot) {
            throw new UnauthorizedException("ليس لديك الصلاحيات لتعديل ملف المسؤول");
        }

        //2:check if user have the same role with updated user
        if (!actionUser.isRoot && userToUpdate.role === "StoreAdmin" && actionUser.role === "StoreAdmin") {
            throw new UnauthorizedException("ليس لديك الصلاحيات لتعديل هذا المستخدم");
        }

        //4:Update User
        const updateUser = await this.userStoreService.update(storeUserId, updateUserStoreDto);

        //5: Log Actions
        if (userToUpdate.email != updateUser.email) {
            await this.logsUserStoreService.createLogUserStore(
                actionUser.store as string,
                updateUser._id as string,
                actionUser.userName,
                `تم تغيير الإيميل الخاص ب ${updateUser.userName} من ${userToUpdate.email} إلى ===> ${updateUser.email} بواسطة ${actionUser.userName}`,
                "تحديث"
            );
        }

        if (userToUpdate.userPhoneNumber != updateUser.userPhoneNumber) {
            await this.logsUserStoreService.createLogUserStore(
                actionUser.store as string,
                updateUser._id as string,
                actionUser.userName,
                `تم تغيير رقم الهاتف الخاص ب ${updateUser.userName} من ${userToUpdate.userPhoneNumber} إلى ===> ${updateUser.userPhoneNumber} بواسطة ${actionUser.userName}`,
                "تحديث"
            );
        }

        if (userToUpdate.userName != updateUser.userName) {
            await this.logsUserStoreService.createLogUserStore(
                actionUser.store as string,
                updateUser._id as string,
                actionUser.userName,
                `تم تغيير إسم المستخدم الخاص ب ${userToUpdate.userName} من ${userToUpdate.userName} إلى ===> ${updateUser.userName} بواسطة ${actionUser.userName}`,
                "تحديث"
            );
        }

        if (userToUpdate.role != updateUser.role) {
            await this.logsUserStoreService.createLogUserStore(
                actionUser.store as string,
                updateUser._id as string,
                actionUser.userName,
                `تم تغيير الصلاحيات الخاصة ب ${updateUser.userName} من ${userToUpdate.role} إلى ===> ${updateUser.role} بواسطة ${actionUser.userName}`,
                "تحديث"
            );
        }

        return updateUser;
    }

    @UserStoreAuth("StoreAdmin", "StoreAccountent")
    @Post("clear-calcs/:storeUserId")
    async clreaStoreUserCalcs(@Param("storeUserId") storeUserId: string, @StoreUser() userStore: Readonly<UserStore>) {
        //first get values befor edit
        const user = await this.userStoreService.findOne(storeUserId);

        //validate totals is exist and > 0
        if (!user.totalOrders || !user.totalProfit || user.totalOrders < 1 || user.totalProfit < 1) {
            throw new BadRequestException("لايمكن القيام بعملية تصفية الحساب");
        }

        //1:Clear UserCalcs
        const clearedCalcsUser = await this.userStoreService.clearUserStoreCalcs(storeUserId);

        //2:Log the Action
        await this.logsUserStoreService.createCalcsLogUserStore(
            userStore.store,
            clearedCalcsUser._id as string,
            clearedCalcsUser.userName,
            `تمت تصفية حساب العضو ${clearedCalcsUser.userName} من ${user.totalProfit} دج و ${user.totalOrders} طلب إلى ===> 0 دج و 0 طلب -- بواسطة ${userStore.userName}`,
            user.totalProfit
        );

        return clearedCalcsUser;
    }

    @Put(":userStoreId")
    async unActivateDesk(@Param("userStoreId", ParseMongoIdPipe) stopDeskId: string, @StoreUser() userStore: Readonly<UserStore>) {
        //2:Desactivate The Desk
        const user = await this.userStoreService.unActivateUserStore(stopDeskId);

        //3:Log Action
        if (user.isActive) {
            this.logsUserStoreService.createLogUserStore(
                userStore.store,
                userStore._id as string,
                userStore.userName,
                `تم تنشيط حساب المستخدم ${user.userName} بواسطة ${userStore.userName}`,
                "تفعيل"
            );
        } else {
            this.logsUserStoreService.createLogUserStore(
                userStore.store,
                userStore._id as string,
                userStore.userName,
                `تم إلغاء تنشيط حساب المستخدم ${user.userName} بواسطة ${userStore.userName}`,
                "إلغاء"
            );
        }

        return user;
    }

    @Delete(":storeUserId")
    async remove(@Param("storeUserId", ParseMongoIdPipe) storeUserId: string, @StoreUser() actionUser: Readonly<UserStore>) {
        //1:check if user is the root
        const userToUpdate = await this.userStoreService.findOne(storeUserId);
        if (userToUpdate?.isRoot) {
            throw new UnauthorizedException("ليس لديك الصلاحيات لحذف ملف المسؤول");
        }

        //2:check if user have the same role with updated user
        if (!actionUser.isRoot && userToUpdate.role === "StoreAdmin" && actionUser.role === "StoreAdmin") {
            throw new UnauthorizedException("ليس لديك الصلاحيات لحذف هذا المستخدم");
        }

        //3: Remove the user
        const deletedUser = await this.userStoreService.remove(storeUserId);

        //4:Log the action
        await this.logsUserStoreService.createLogUserStore(
            actionUser.store as string,
            deletedUser._id as string,
            actionUser.userName,
            `تم حذف المستخدم ${deletedUser.userName} بواسطة ${actionUser.userName}`,
            "حذف"
        );
        return deletedUser;
    }
}
