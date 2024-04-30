import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { CreateStoreDto } from "./dto/create-store.dto";
import { UpdateStoreDto } from "./dto/update-store.dto";
import { HandlersFactory } from "src/utils/handlersFactory";
import { InjectModel } from "@nestjs/mongoose";
import { Store } from "./schema/store.schema";
import { Model } from "mongoose";
import { defaultStoreSettings } from "src/constants/storeDefualtSettings";
import { UserStore } from "../user-store/schema/user-store.schema";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { TQueryParams } from "src/@types/QueryParams.type";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { UpdateStoreFromStopDeskDto } from "./dto/update-store-from-stop-desk.dto";
import { UserStoreService } from "../user-store/user-store.service";
import { StoreLocationService } from "../store-location/store-location.service";
import { StorePageService } from "../store-page/store-page.service";
import { StorePublicSignUpDto } from "./dto/store-public-sign-up.dto";
import { execSync } from "child_process";
import { MailService } from "src/common/services/mail.service";

@Injectable()
export class StoreService {
    constructor(
        @InjectModel(Store.name) private storeModel: Model<Store>,
        @InjectModel(UserStore.name) private userStoreModel: Model<UserStore>,
        private readonly userStoreService: UserStoreService,
        private readonly storeLocationService: StoreLocationService,
        private readonly storePageService: StorePageService,
        private readonly mailService: MailService
    ) {}

    async create(createStoreDto: CreateStoreDto | StorePublicSignUpDto, stopDeskId: string, isSubStore: boolean) {
        //1: Make Sure SubDomain Is unique
        const storeSubDomain = (await this.storeModel.findOne({ storeSubDomain: createStoreDto.storeSubDomain }))?.storeSubDomain;
        if (storeSubDomain) {
            throw new BadRequestException("نطاق المتجر محجوز يرجى إدخال إسم نطاق جديد");
        }

        //2: Make Sure User Email Is unique
        const userCheck = await this.userStoreModel.findOne({ email: createStoreDto.userEmail });
        if (userCheck) {
            throw new ForbiddenException(ErrorMessages.EMAIL_ALREADY_EXIST);
        }

        //3: Create Host CNAME
        if (EnviromentsClass.NODE_ENV === "PROD") {
            try {
                const hostCnameCreateOutput = execSync(
                    `v-add-dns-record ${EnviromentsClass.HESTIA_CP_USER} ${EnviromentsClass.COMPANY_BASE_DOMAIN} ${createStoreDto.storeSubDomain} A ${EnviromentsClass.SERVER_IP}`,
                    {
                        encoding: "utf-8",
                    }
                );
                if (hostCnameCreateOutput.toLowerCase().includes("error")) {
                    throw new BadRequestException(hostCnameCreateOutput);
                }
            } catch (error) {
                throw new BadRequestException("حدث خطأ في Create Host CNAME");
            }
        }

        //5: Create Store
        const store = await HandlersFactory.create(this.storeModel, {
            ...createStoreDto,
            ...(defaultStoreSettings as Store),
            subScriptionExpireAfterDays: 31,
            storeSubDomain: createStoreDto.storeSubDomain,
            createdByStopDesk: stopDeskId,
        });

        //6: Create Demo Locations
        await this.storeLocationService.createBulk(store._id.toString());

        //7: Create Demo Pages
        await this.storePageService.createDemo(store._id.toString());

        //8: Craete Admin User For the Store
        const { userEmail, userName, userPhoneNumber } = createStoreDto;
        let userPassword;
        if (createStoreDto.password) {
            userPassword = createStoreDto.password;
        } else {
            userPassword = EnviromentsClass.STORE_DEF_PASSWORD;
        }

        const user = await this.userStoreService.create(
            {
                userName,
                email: userEmail,
                userPhoneNumber,
                password: userPassword,
                isRoot: true,
            },
            store._id.toString()
        );

        //9: Update Store AdminUser ID
        store.storeOwner = user._id.toString();
        await store.save();

        if (EnviromentsClass.COMPNAY_ECO_SYSTEM != "safir-click") {
            //10: Send Login Credentials to User Email
            if (isSubStore) {
                await this.mailService.sendUserSubStoreLoginDetialsEmail(user as UserStore, userPassword, store.storeSubDomain as string);
            } else {
                await this.mailService.sendUserStoreLoginDetialsEmail(user as UserStore, userPassword);
            }
        }

        //Response
        return store;
    }

    async findAllByPayload(queryParams: TQueryParams, payload: Partial<Store>) {
        const apiFeatures = await apiFeaturesHelper(this.storeModel, this.storeModel, queryParams, payload);
        const documents = await apiFeatures.mongooseQuery;

        return {
            results: documents.length,
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOne(id: string) {
        return HandlersFactory.findOne(this.storeModel, id);
    }

    findOneByPayload(payload: Partial<Store>) {
        return HandlersFactory.findOneByPayload(this.storeModel, payload, ErrorMessages.NO_STORE_FOUND);
    }

    update(id: string, updateStoreDto: UpdateStoreDto) {
        return HandlersFactory.update(this.storeModel, { ...updateStoreDto }, id);
    }

    updateFromStopDesk(id: string, updateStoreFromStopDeskDto: UpdateStoreFromStopDeskDto) {
        return HandlersFactory.update(this.storeModel, updateStoreFromStopDeskDto, id);
    }

    resetDefualtSettings(storeId: string) {
        return HandlersFactory.update(this.storeModel, { ...defaultStoreSettings }, storeId);
    }

    async subscreptionsCheckerInterval() {
        console.log('reset montly sucscreption')
        await this.storeModel.updateMany(
            { subScriptionExpireAfterDays: { $eq: 0 }, isMonthlySubscreptionPaid: true }, // Filter documents created before 30 days
            { $set: { isMonthlySubscreptionPaid: false } }
        );
    }
    
    async subscreptionsDecreaserInterval() {
        console.log('decrease on day sucscreption')
        await this.storeModel.updateMany(
            { subScriptionExpireAfterDays: { $gt: 0 }, isMonthlySubscreptionPaid: true }, // Filter documents created before 30 days
            { $inc: { subScriptionExpireAfterDays: -1 } }
        );
    }
}
