import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { CreateUserCompanyDto } from "./dto/create-user-company.dto";
import { UpdateUserCompanyDto } from "./dto/update-user-company.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { UserCompany } from "./schema/user-company.schema";
import { Model } from "mongoose";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { generateRandomPassword } from "src/utils/generateRandomPassword";
import { BcryptService } from "src/common/services/bcrypt.service";
import { TwoFactoryService } from "src/common/services/twoFactory.service";
import { MailService } from "src/common/services/mail.service";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { TQueryParams } from "src/@types/QueryParams.type";
import parseMongoJSON from "src/utils/parseMongoJSON";

@Injectable()
export class UserCompanyService {
    constructor(
        @InjectModel(UserCompany.name) private userCompanyUserModel: Model<UserCompany>,
        private bcryptService: BcryptService,
        private twoFactoryService: TwoFactoryService,
        private mailService: MailService
    ) {}

    async create(createUserCompanyDto: CreateUserCompanyDto) {
        //1: Check if email is unique
        const userCompany = await this.userCompanyUserModel.findOne({ email: createUserCompanyDto.email });

        if (userCompany) {
            throw new BadRequestException(ErrorMessages.EMAIL_ALREADY_EXIST);
        }

        //2: Generate Password & HashIt
        const password = generateRandomPassword();
        const hashedPassword = await this.bcryptService.hash(password);

        //3: Generate 2FA Secrets
        const twoFactoryObject = this.twoFactoryService.generace2FaSecret(createUserCompanyDto.email);

        //4: Create User
        const createdUser = await this.userCompanyUserModel.create({
            ...createUserCompanyDto,
            password: hashedPassword,
            twoFactoryQr: twoFactoryObject.qr,
            twoFactorySecretCode: twoFactoryObject.secret,
        });

        //5: Send Email To User
        await this.mailService.sendUserCompanyLoginDetialsEmail(createdUser, password);

        //Response
        return createdUser;
    }

    async findAll(queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.userCompanyUserModel, this.userCompanyUserModel, queryParams);
        const documents = await apiFeatures.mongooseQuery;

        return {
            ...apiFeatures.paginateResults,
            documents: parseMongoJSON(documents),
        };
    }

    findOne(companyUserId: string) {
        return HandlersFactory.findOne(this.userCompanyUserModel, companyUserId);
    }

    findOneByPayload(payload: Partial<UserCompany>, errorMessage: string) {
        return HandlersFactory.findOneByPayload(this.userCompanyUserModel, payload, errorMessage);
    }

    findOneByEmail(email: string) {
        return HandlersFactory.findOneByPayload(this.userCompanyUserModel, { email }, "البريد الإلكتروني أو كلمة السر خاطئة");
    }

    async update(companyUserId: string, updateUserCompanyDto: UpdateUserCompanyDto) {
        const companyUser = await HandlersFactory.findOne(this.userCompanyUserModel, companyUserId);

        //Check if email changed regenerage Login Detials
        if (updateUserCompanyDto.email && updateUserCompanyDto.email != companyUser.email) {
            //0:check if email is uniqeu
            const companyUserByEmail = await this.userCompanyUserModel.findOne({ email: updateUserCompanyDto.email });
            if (companyUserByEmail) {
                throw new ForbiddenException(ErrorMessages.EMAIL_ALREADY_EXIST);
            }

            //1:create and hash new Password
            const password = generateRandomPassword();
            const hashedPassword = await this.bcryptService.hash(password);

            //2: genereate new 2FA secret
            const twoFactoryObject = this.twoFactoryService.generace2FaSecret(updateUserCompanyDto.email as string);

            //3:Update user
            const updatedUser = await HandlersFactory.update(
                this.userCompanyUserModel,
                {
                    ...updateUserCompanyDto,
                    password: hashedPassword,
                    twoFactoryQr: twoFactoryObject.qr,
                    twoFactorySecretCode: twoFactoryObject.secret,
                },
                companyUserId
            );

            //4:Send Email
            await this.mailService.sendUserCompanyLoginDetialsEmail(updatedUser, password);
            return updatedUser;
        } else {
            //3:Update user
            const updatedUser = await HandlersFactory.update(this.userCompanyUserModel, { ...updateUserCompanyDto }, companyUserId);
            return updatedUser;
        }
    }

    remove(companyUserId: string) {
        return HandlersFactory.remove(this.userCompanyUserModel, companyUserId);
    }
}
