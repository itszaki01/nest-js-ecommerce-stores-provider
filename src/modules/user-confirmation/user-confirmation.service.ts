import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserConfirmationDto } from "./dto/create-user-confirmation.dto";
import { UpdateUserConfirmationDto } from "./dto/update-user-confirmation.dto";
import { InjectModel } from "@nestjs/mongoose";
import { UserConfirmation } from "./schema/user-confirmation.schema";
import { Model } from "mongoose";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { generateRandomPassword } from "src/utils/generateRandomPassword";
import { BcryptService } from "src/common/services/bcrypt.service";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { MailService } from "src/common/services/mail.service";
import { HandlersFactory } from "src/utils/handlersFactory";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import { StoreOrder } from "../store-order/schema/store-order.schema";
import { StoreOrderService } from "../store-order/store-order.service";
import parseMongoJSON from "src/utils/parseMongoJSON";

@Injectable()
export class UserConfirmationService {
    constructor(
        @InjectModel(UserConfirmation.name) private readonly userComfirmationModel: Model<UserConfirmation>,
        @InjectModel(StoreOrder.name) private readonly storeOrderModel: Model<StoreOrder>,
        private readonly bcryptService: BcryptService,
        private readonly twoFactoryService: TwoFactoryService,
        private readonly mailService: MailService,
        private readonly storeOrderService: StoreOrderService
    ) {}
    async create(createUserConfirmationDto: CreateUserConfirmationDto) {
        //1: check if user email is unique
        const user = await this.userComfirmationModel.findOne({ email: createUserConfirmationDto.email });
        if (user) {
            throw new BadRequestException(ErrorMessages.EMAIL_ALREADY_EXIST);
        }

        //1.1 check if user phone number is unique
        const userPhone = await this.userComfirmationModel.findOne({ userPhoneNumber: createUserConfirmationDto.userPhoneNumber });
        if (userPhone) {
            throw new BadRequestException(`رقم الهاتف مستخدم حاليا من طرف ${userPhone.userName}`);
        }

        //2: generate and hash password
        const password = generateRandomPassword();
        const hashedPasswrod = await this.bcryptService.hash(password);

        //3: generate 2FA
        const twoFactory = this.twoFactoryService.generace2FaSecret(createUserConfirmationDto.email);

        //4: Create user
        const cashSecretCode = Math.trunc(Math.random() * 1000000);

        const newUser = await HandlersFactory.create(this.userComfirmationModel, {
            ...createUserConfirmationDto,
            twoFactoryQr: twoFactory.qr,
            twoFactorySecretCode: twoFactory.secret,
            password: hashedPasswrod,
            cashSecretCode: String(cashSecretCode),
            passwordChangedAt: new Date(Date.now()),
            role: "UserConfirmation",
            totalConfirmedOrders: 0,
            totalProfit: 0,
        });

        //5: Send Credantials Email
        await this.mailService.sendUserConfirmationLoginDetialsEmail(newUser, password);

        return newUser;
    }

    async findAllWithStatus(queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.userComfirmationModel, this.userComfirmationModel, queryParams);
        const documents = (await apiFeatures.mongooseQuery) as UserConfirmation[];
        const newDocs = documents.map(async (doc) => {
            const userStatus = await this.storeOrderService.findAllStatus({ _id: doc._id, role: "UserConfirmation" } as UserConfirmation);
            return { ...parseMongoJSON(doc), ...parseMongoJSON(userStatus) };
        });
        const docs = await Promise.all(newDocs);

        return {
            ...apiFeatures.paginateResults,
            documents: docs,
        };
    }

    async findAll(queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.userComfirmationModel, this.userComfirmationModel, queryParams);
        const documents = await apiFeatures.mongooseQuery;

        return {
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOne(userConfirmationId: string) {
        return HandlersFactory.findOne(this.userComfirmationModel, userConfirmationId);
    }

    findOneByPayload(objectData: Partial<UserConfirmation & { _id: string }>, reason: string) {
        return HandlersFactory.findOneByPayload(this.userComfirmationModel, objectData, reason);
    }

    findOneByEmail(email: string) {
        return HandlersFactory.findOneByPayload(this.userComfirmationModel, { email }, "لم يتم العثور على أي عضو بهذا الإيميل");
    }

    findOneByPhone(userPhoneNumber: string) {
        return HandlersFactory.findOneByPayload(this.userComfirmationModel, { userPhoneNumber }, "لم يتم العثور على أي عضو بهذا الرقم");
    }

    async update(userConfirmationId: string, updateUserConfirmationDto: UpdateUserConfirmationDto) {
        //1: Check Email is Unique
        const userConfirmation = await HandlersFactory.findOne(this.userComfirmationModel, userConfirmationId);

        //1.1 check if user phone number is unique
        const userPhone = await this.userComfirmationModel.findOne({ userPhoneNumber: updateUserConfirmationDto.userPhoneNumber });
        if (userPhone && userPhone?._id != userConfirmationId) {
            throw new BadRequestException(`رقم الهاتف مستخدم حاليا من طرف ${userPhone?.userName}`);
        }

        if (updateUserConfirmationDto.email && updateUserConfirmationDto.email != userConfirmation.email) {
            //0:check if email is uniqeu
            const companyUserByEmail = await this.userComfirmationModel.findOne({ email: updateUserConfirmationDto.email });
            if (companyUserByEmail) {
                throw new ForbiddenException(ErrorMessages.EMAIL_ALREADY_EXIST);
            }

            //1:create and hash new Password
            const password = generateRandomPassword();
            const hashedPassword = await this.bcryptService.hash(password);

            //2: genereate new 2FA secret
            const twoFactoryObject = this.twoFactoryService.generace2FaSecret(updateUserConfirmationDto.email as string);

            //3:Update user
            const updatedUser = await HandlersFactory.update(
                this.userComfirmationModel,
                {
                    ...updateUserConfirmationDto,
                    password: hashedPassword,
                    twoFactoryQr: twoFactoryObject.qr,
                    twoFactorySecretCode: twoFactoryObject.secret,
                },
                userConfirmationId
            );

            //4:Send Email
            await this.mailService.sendUserConfirmationLoginDetialsEmail(updatedUser, password);
            return updatedUser;
        } else {
            //3:Update user
            const updatedUser = await HandlersFactory.update(this.userComfirmationModel, { ...updateUserConfirmationDto }, userConfirmationId);
            return updatedUser;
        }
    }

    async clearUserConfirmationCalcs(userConfirmatinoId: string) {
        //1: Cleare Orders Fees Cacls
        const orders = await this.storeOrderModel.updateMany(
            { assignToStoreCallMember: userConfirmatinoId, isStoreFeesPaid: false, isInDelivery: true },
            { isStoreFeesPaid: true }
        );
        if (!orders) {
            throw new NotFoundException(ErrorMessages.NO_ORDER_FOUND);
        }

        //2:Cleare User Profile Calcs
        return HandlersFactory.update(this.userComfirmationModel, { totalConfirmedOrders: 0, totalProfit: 0 }, userConfirmatinoId);
    }

    async unActivateUserConfirmation(userConfirmationId: string) {
        const userConfirmtaion = await HandlersFactory.findOne(this.userComfirmationModel, userConfirmationId);
        if (userConfirmtaion.isActive) {
            userConfirmtaion.isActive = false;
        } else {
            userConfirmtaion.isActive = true;
        }
        await userConfirmtaion.save();
        return userConfirmtaion;
    }

    remove(userConfirmationId: string) {
        return HandlersFactory.remove(this.userComfirmationModel, userConfirmationId);
    }
}
