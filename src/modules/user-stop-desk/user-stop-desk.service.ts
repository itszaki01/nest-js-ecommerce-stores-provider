import { ForbiddenException, Injectable } from "@nestjs/common";
import { CreateUserStopDeskDto } from "./dto/create-user-stop-desk.dto";
import { UpdateUserStopDeskDto } from "./dto/update-user-stop-desk.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { UserStopDesk } from "./schema/user-stop-desk.schema";
import { Model } from "mongoose";
import { BcryptService } from "src/common/services/bcrypt.service";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { TQueryParams } from "src/@types/QueryParams.type";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { generateRandomPassword } from "src/utils/generateRandomPassword";
import { MailService } from "src/common/services/mail.service";

@Injectable()
export class UserStopDeskService {
    constructor(
        @InjectModel(UserStopDesk.name) private userStopDeskModel: Model<UserStopDesk>,
        private bcryptService: BcryptService,
        private twoFactoryService: TwoFactoryService,
        private mailService: MailService
    ) {}

    async create(createUserStopDeskDto: CreateUserStopDeskDto) {
        //1: Check Email is Unique
        const stopDeskUser = await this.userStopDeskModel.findOne({ email: createUserStopDeskDto.email });
        if (stopDeskUser) {
            throw new ForbiddenException(ErrorMessages.EMAIL_ALREADY_EXIST);
        }

        //2: Generate Password && Hash IT
        const password = generateRandomPassword();
        const hashedPassword = await this.bcryptService.hash(password);

        //3: Generate 2Fa Token
        const twoFactoryObject = this.twoFactoryService.generace2FaSecret(createUserStopDeskDto.email);

        //4: Create StopDesk User
        const newStopDeskUser = await HandlersFactory.create(this.userStopDeskModel, {
            ...createUserStopDeskDto,
            password: hashedPassword,
            twoFactorySecretCode: twoFactoryObject.secret,
            twoFactoryQr: twoFactoryObject.qr,
        });

        await this.mailService.sendUserStopDeskLoginDetialsEmail(newStopDeskUser as UserStopDesk, password);

        return newStopDeskUser;
    }

    async findAll(queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.userStopDeskModel, this.userStopDeskModel, queryParams);
        const documents = await apiFeatures.mongooseQuery;

        return {
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOne(id: string) {
        return HandlersFactory.findOne(this.userStopDeskModel, id);
    }

    findOneByEmail(email: string) {
        return HandlersFactory.findOneByPayload(this.userStopDeskModel, { email }, ErrorMessages.BAD_EMAIL_OR_PASS_AR);
    }

    findOneByPayload(objectData: Partial<UserStopDesk & { _id: string }>, reason: string) {
        return HandlersFactory.findOneByPayload(this.userStopDeskModel, objectData, reason);
    }

    async update(stopDeskId: string, updateUserStopDeskDto: Partial<UpdateUserStopDeskDto>) {
        //1: Check Email is Unique
        const stopDeskUser = await HandlersFactory.findOne(this.userStopDeskModel, stopDeskId);
        if (updateUserStopDeskDto.email && updateUserStopDeskDto.email !== stopDeskUser.email) {
            //0:check if email is uniqeu

            const companyUserByEmail = await this.userStopDeskModel.findOne({ email: updateUserStopDeskDto.email });
            if (companyUserByEmail) {
                throw new ForbiddenException(ErrorMessages.EMAIL_ALREADY_EXIST);
            }

            //1:create and hash new Password
            const password = generateRandomPassword();
            const hashedPassword = await this.bcryptService.hash(password);

            //2: genereate new 2FA secret
            const twoFactoryObject = this.twoFactoryService.generace2FaSecret(updateUserStopDeskDto.email as string);

            //3:Update user
            const updateStopDesk = await HandlersFactory.update(
                this.userStopDeskModel,
                {
                    ...updateUserStopDeskDto,
                    password: hashedPassword,
                    twoFactoryQr: twoFactoryObject.qr,
                    twoFactorySecretCode: twoFactoryObject.secret,
                },
                stopDeskId
            );

            //4:Send Email
            await this.mailService.sendUserStopDeskLoginDetialsEmail(updateStopDesk, password);
            return updateStopDesk;
        } else {
            //3:Update user
            const updateStopDesk = await HandlersFactory.update(this.userStopDeskModel, { ...updateUserStopDeskDto }, stopDeskId);
            return updateStopDesk;
        }
    }

    async unActivateStopDesk(stopDeskId: string) {
        const stopDeskUser = await HandlersFactory.findOne(this.userStopDeskModel, stopDeskId);
        if (stopDeskUser.isActive) {
            stopDeskUser.isActive = false;
        } else {
            stopDeskUser.isActive = true;
        }
        await stopDeskUser.save();
        return stopDeskUser;
    }
}
