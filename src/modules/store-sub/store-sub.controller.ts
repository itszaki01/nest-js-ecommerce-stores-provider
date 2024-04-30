import { Controller, Post, Body, Param, UnauthorizedException, Get, Put, Patch, BadRequestException } from "@nestjs/common";
import { CreateStoreSubDto } from "./dto/create-store-sub.dto";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";
import { StoreService } from "../store/store.service";
import { StoreObject } from "../store/decorator/store-objcet.decorator";
import { Store } from "../store/schema/store.schema";
import { CreateStoreDto } from "../store/dto/create-store.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StoreStopDeskService } from "../store/store-stop-desk.service";
import { UserStoreService } from "../user-store/user-store.service";
import { UpdateStoreSubDto } from "./dto/update-store-sub.dto";

@UserStoreAuth("StoreAdmin")
@Controller("store-sub")
export class StoreSubController {
    constructor(
        private readonly storeService: StoreService,
        private readonly storeStopDeskService: StoreStopDeskService,
        private readonly userStoreService: UserStoreService,
        @InjectModel(Store.name) private storeModel: Model<Store>
    ) {}

    @Get()
    findAll(@StoreObject() store: Readonly<Store>) {
        //1:check premission
        if (store.isSubStore) {
            throw new UnauthorizedException("ليس لديك الصلاحيات");
        }

        return this.storeModel.find({ isSubStore: true, mainStore: store._id as string });
    }

    @Post()
    async create(@Body() createStoreSubDto: CreateStoreSubDto, @StoreObject() store: Readonly<Store>) {
        //1:check premission
        if (store.isSubStore || store.storeSubcreption != "pro") {
            throw new UnauthorizedException("ليس لديك الصلاحيات لإنشاء متاجر فرعية");
        }

        //2:check limits
        const stores = await this.storeModel.find({ mainStore: store._id });
        if (stores.length >= 5) {
            throw new UnauthorizedException("لايمكن إنشاء أكثر من 5 متاجر فرعية");
        }

        const newStore = await this.storeService.create(
            {
                ...createStoreSubDto,
                apiKey1: store.apiKey1,
                apiKey2: store.apiKey2,
                apiKey3: store.apiKey3,
                password: createStoreSubDto.password,
                storeSubcreption: "pro",
            } as CreateStoreDto,
            store.createdByStopDesk as string,
            true
        );
        newStore.isSubStore = true;
        newStore.mainStore = store._id as string;
        await newStore.save();
        return newStore;
    }

    @Get(":subStoreId")
    async findOne(@Param("subStoreId") subStoreId: string, @StoreObject() store: Readonly<Store>) {
        //1: Get Targeted Store
        const subStore = await this.storeModel.findById(subStoreId);

        if (!subStore?.isSubStore || store.isSubStore) {
            throw new UnauthorizedException("ليس لديك الصلاحيات");
        }

        //2:check if target deleted subStore is belong main store
        const stores = (await this.storeModel.find({ mainStore: store._id })).map((doc) => doc._id.toString());
        if (!stores.includes(subStore?._id.toString() as string)) {
            throw new UnauthorizedException("ليس لديك الصلاحيات لحذف المتجر");
        }

        return this.storeService.findOne(subStoreId);
    }

    @Patch(":subStoreId")
    async updateSubStore(
        @Param("subStoreId") subStoreId: string,
        @StoreObject() store: Readonly<Store>,
        @Body() updateStoreSubDto: UpdateStoreSubDto
    ) {
        //1: Get Targeted Store
        const subStore = await this.storeModel.findById(subStoreId);

        if (!subStore?.isSubStore || store.isSubStore) {
            throw new UnauthorizedException("ليس لديك الصلاحيات");
        }

        //2:Get SubStore RootAdmin
        const rootAdmin = await this.userStoreService.findOne(subStore.storeOwner as string);

        //2:check if target Updated User subStore is belong main store
        const stores = (await this.storeModel.find({ mainStore: store._id })).map((doc) => doc._id.toString());

        if (!stores.includes(rootAdmin.store.toString() as string)) {
            throw new UnauthorizedException("ليس لديك الصلاحيات لتعديل المستخدم");
        }

        //3:Update SubStoreUser
        await this.userStoreService.update(rootAdmin._id, {
            email: updateStoreSubDto.userEmail,
            userPhoneNumber: updateStoreSubDto.userPhoneNumber,
            userName: updateStoreSubDto.userName,
        });

        //4: Update SubStore Domain if chenged
        if (updateStoreSubDto.storeSubDomain != subStore.storeSubDomain) {
            //4.1 check sub domain is unique
            const subStoreToCheck = await this.storeModel.findOne({ storeSubDomain: updateStoreSubDto.storeSubDomain });
            if(subStoreToCheck){
                throw new BadRequestException('إسم المتجر محجوز من قبل')
            }
            subStore.storeSubDomain = updateStoreSubDto.storeSubDomain
            await subStore.save()
        }

        return subStore
    }

    @Put(":subStoreId")
    async unActivateStore(@Param("subStoreId") subStoreId: string, @StoreObject() store: Readonly<Store>) {
        //1: Get Targeted Store
        const toUnactivateStore = await this.storeModel.findById(subStoreId);

        if (!toUnactivateStore?.isSubStore || store.isSubStore) {
            throw new UnauthorizedException("ليس لديك الصلاحيات");
        }

        //2:check if target deleted subStore is belong main store
        const stores = (await this.storeModel.find({ mainStore: store._id })).map((doc) => doc._id.toString());
        if (!stores.includes(toUnactivateStore?._id.toString() as string)) {
            throw new UnauthorizedException("ليس لديك الصلاحيات لحذف المتجر");
        }
        return this.storeStopDeskService.unActivateStore(subStoreId);
    }
}
