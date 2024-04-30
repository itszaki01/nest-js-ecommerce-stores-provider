import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserStoreDto } from "./dto/create-user-store.dto";
import { UpdateUserStoreDto } from "./dto/update-user-store.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { UserStore } from "./schema/user-store.schema";
import { Model } from "mongoose";
import { TQueryParams } from "src/@types/QueryParams.type";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { BcryptService } from "src/common/services/bcrypt.service";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { StoreOrder } from "../store-order/schema/store-order.schema";

@Injectable()
export class UserStoreService {
    constructor(
        @InjectModel(UserStore.name) private userStoreModel: Model<UserStore>,
        @InjectModel(StoreOrder.name) private storeOrderModel: Model<StoreOrder>,
        private readonly bcryptService: BcryptService
    ) {}

    async create(createUserStoreDto: CreateUserStoreDto, storeId: string) {
        //1:Check if Email is unique
        const user = await this.userStoreModel.findOne({ email: createUserStoreDto.email });
        if (user) {
            throw new BadRequestException(ErrorMessages.EMAIL_ALREADY_EXIST);
        }

        //2:hash password
        const hashedPassword = await this.bcryptService.hash(createUserStoreDto.password);

        //3:Create Store User
        return HandlersFactory.create(this.userStoreModel, {
            ...createUserStoreDto,
            store: storeId,
            password: hashedPassword,
            passwordChangedAt: new Date(Date.now()),
            totalOrders: 0,
            totalProfit: 0,
        });
    }

    async findAllByPayload(queryParams: TQueryParams, payload: Partial<UserStore>) {
        const apiFeatures = await apiFeaturesHelper(this.userStoreModel, this.userStoreModel, queryParams, payload);
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOne(id: string) {
        return HandlersFactory.findOne(this.userStoreModel, id);
    }

    findOneByPayload(payload: Partial<UserStore>, reason: string) {
        return HandlersFactory.findOneByPayload(this.userStoreModel, payload, reason);
    }

    findOneByEmail(email: string) {
        return HandlersFactory.findOneByPayload(this.userStoreModel, { email }, ErrorMessages.BAD_EMAIL_OR_PASS_AR);
    }

    async update(id: string, updateUserStoreDto: UpdateUserStoreDto) {
        //1:Get User
        const userStore = await HandlersFactory.findOne(this.userStoreModel, id);
        if (updateUserStoreDto.email && updateUserStoreDto.email !== userStore.email) {
            //0:check if email is uniqeu
            const companyUserByEmail = await this.userStoreModel.findOne({ email: updateUserStoreDto.email });
            if (companyUserByEmail) {
                throw new ForbiddenException(ErrorMessages.EMAIL_ALREADY_EXIST);
            }
        }
        return HandlersFactory.update(this.userStoreModel, { ...updateUserStoreDto }, id);
    }

    async clearUserStoreCalcs(id: string) {
        const orders = await this.storeOrderModel.updateMany(
            { assignToStoreCallMember: id, isStoreFeesPaid: false, isInDelivery: true,isCartMainOrder:true },
            { isStoreFeesPaid: true }
        );
        if (!orders) {
            throw new NotFoundException(ErrorMessages.NO_ORDER_FOUND);
        }
        return HandlersFactory.update(this.userStoreModel, { totalOrders: 0, totalProfit: 0 }, id);
    }

    async unActivateUserStore(userStoreId: string) {
        const userStore = await HandlersFactory.findOne(this.userStoreModel, userStoreId);
        if (userStore.isActive) {
            userStore.isActive = false;
        } else {
            userStore.isActive = true;
        }
        await userStore.save();
        return userStore;
    }

    remove(id: string) {
        return HandlersFactory.remove(this.userStoreModel, id);
    }
}
