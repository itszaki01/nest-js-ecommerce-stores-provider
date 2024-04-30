import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateStoreDomainDto } from "./dto/create-store-domain.dto";
import { UpdateStoreDomainDto } from "./dto/update-store-domain.dto";
import { InjectModel } from "@nestjs/mongoose";
import { StoreDomain } from "./schema/store-domain.schema";
import { Model } from "mongoose";
import apiFeaturesHelper from "src/helpers/apiFeaturesHelper";
import { HandlersFactory } from "src/utils/handlersFactory";
import { TQueryParams } from "src/@types/QueryParams.type";
import { ErrorMessages } from "src/constants/ErrorMessage";
import { execSync } from "child_process";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { StoreService } from "../store/store.service";

@Injectable()
export class StoreDomainService {
    constructor(
        @InjectModel(StoreDomain.name) private storeDomainModel: Model<StoreDomain>,
        private readonly storeService: StoreService
    ) {}

    async create(createStoreDomainDto: CreateStoreDomainDto, storeId: string) {
        //Check LIMITS
        const userDomains = await this.storeDomainModel.find({ store: storeId }); //Get Store Domain
        const store = await this.storeService.findOne(storeId);
        if (store.storeSubcreption === "basic" && userDomains.length >= 2) {
            throw new UnauthorizedException("لقد وصلت للحد الأقصى من عدد النطاقات المسموح");
        } else if (store.storeSubcreption === "pro" && userDomains.length >= 8) {
            throw new UnauthorizedException("لقد وصلت للحد الأقصى من عدد النطاقات المسموح");
        }

        //1:Check if the domain is Existing Before
        const domain = await this.storeDomainModel.findOne({ domainName: createStoreDomainDto.domainName });
        if (domain) {
            throw new BadRequestException("هذا النطاق مربوط بالفعل أو تابع لمتجر آخر");
        }

        try {
            //2:Create WEB Domain
            const createWebDomainOutput = execSync(
                `v-add-web-domain ${EnviromentsClass.HESTIA_CP_USER} ${createStoreDomainDto.domainName} ${EnviromentsClass.SERVER_IP}`,
                { encoding: "utf-8" }
            );
            if (createWebDomainOutput.toLowerCase().includes("error")) {
                throw new BadRequestException(createWebDomainOutput);
            }
        } catch (error) {
            throw new BadRequestException("حدثت مشكلة في Create Web Domain");
        }

        //3:Create DNS Domain
        try {
            const createDnsDomainOutput = execSync(
                `v-add-dns-domain ${EnviromentsClass.HESTIA_CP_USER} ${createStoreDomainDto.domainName} ${EnviromentsClass.SERVER_IP} ${EnviromentsClass.SERVER_NS1} ${EnviromentsClass.SERVER_NS2}`,
                { encoding: "utf-8" }
            );
            if (createDnsDomainOutput.toLowerCase().includes("error")) {
                throw new BadRequestException(createDnsDomainOutput);
            }
        } catch (error) {
            throw new BadRequestException("حدثت مشكلة في Create Dns Domain");
        }

        //4:Change Web Doc root
        try {
            const changeDocroot = execSync(
                `v-change-web-domain-docroot ${EnviromentsClass.HESTIA_CP_USER} ${createStoreDomainDto.domainName} ${EnviromentsClass.COMPANY_BASE_DOMAIN}`,
                { encoding: "utf-8" }
            );
            if (changeDocroot.toLowerCase().includes("error")) {
                throw new BadRequestException(changeDocroot);
            }
        } catch (error) {
            throw new BadRequestException("حدثت مشكلة في Change Web DocRoot");
        }

        //5:Write To DB
        return HandlersFactory.create(this.storeDomainModel, { ...createStoreDomainDto, store: storeId });
    }

    async verifyDomain(domainId: string) {
        const domain = await HandlersFactory.findOne(this.storeDomainModel, domainId);
        //first clear dnsCashe
        execSync(`sudo systemctl restart systemd-resolved`, { encoding: "utf-8" });

        //1:Check if domain pointed to NAME-SERVERS
        try {
            const output = execSync(`ping -c 1 ${domain.domainName}`, { encoding: "utf-8" });
            if (!output.includes(EnviromentsClass.SERVER_IP)) {
                throw new BadRequestException("أعد المحاولة لاحقا، لم يتم ربط موقعك بعد");
            }
        } catch (error) {
            throw new BadRequestException("أعد المحاولة لاحقا، لم يتم ربط موقعك بعد");
        }

        //2:Create SSL Domain
        try {
            const createSSLDomainOutput = execSync(`v-add-letsencrypt-domain ${EnviromentsClass.HESTIA_CP_USER} ${domain.domainName}`, {
                encoding: "utf-8",
            });
            if (createSSLDomainOutput.toLowerCase().includes("error")) {
                throw new BadRequestException(createSSLDomainOutput);
            }
        } catch (error) {
            throw new BadRequestException("حدثت مشكلة أثناء إنشاء شهادة SSL");
        }

        //3:Force SSL
        try {
            const forceDomainSSLOutput = execSync(`v-add-web-domain-ssl-force ${EnviromentsClass.HESTIA_CP_USER} ${domain.domainName}`, {
                encoding: "utf-8",
            });
            if (forceDomainSSLOutput.toLowerCase().includes("error")) {
                throw new BadRequestException(forceDomainSSLOutput);
            }
        } catch (error) {
            throw new BadRequestException("حدثت مشكلة في Force-ssl");
        }

        //4:change domain isVerified to true and save
        domain.isVerified = true;
        await domain.save();

        return { message: "Domain Successfuly pointed" };
    }

    async findAll(storeId: string, queryParams: TQueryParams) {
        const apiFeatures = await apiFeaturesHelper(this.storeDomainModel, this.storeDomainModel, queryParams, { store: storeId });
        const documents = await apiFeatures.mongooseQuery;

        return {
            ...apiFeatures.paginateResults,
            documents,
        };
    }

    findOneByPayload(domainName: string) {
        return HandlersFactory.findOneByPayload(this.storeDomainModel, { domainName, isVerified: true }, ErrorMessages.NO_DOMAIN_FOUND);
    }

    updateOneByPayload(domainId: string, storeId: string, updateStoreDomainDto: UpdateStoreDomainDto) {
        return HandlersFactory.updateOneByPayload(
            this.storeDomainModel,
            { store: storeId, _id: domainId },
            { ...updateStoreDomainDto },
            ErrorMessages.NO_DOMAIN_FOUND
        );
    }

    async removeOneByPayload(domainId: string, storeId: string) {
        //1: Get Domain Doc
        const domain = await HandlersFactory.findOneByPayload(
            this.storeDomainModel,
            { store: storeId, _id: domainId },
            ErrorMessages.NO_DOMAIN_FOUND
        );

        //2: Remove DNS Zone Domain
        try {
            const removeDNSDomainOutput = execSync(`v-delete-dns-domain ${EnviromentsClass.HESTIA_CP_USER} ${domain.domainName}`, {
                encoding: "utf-8",
            });
            if (removeDNSDomainOutput.toLowerCase().includes("error")) {
                throw new BadRequestException(removeDNSDomainOutput);
            }
        } catch (error) {
            throw new BadRequestException("حدث خطأ في Remove Dns Domain");
        }

        //3: Remove WEB Domain
        try {
            const removeWebDomainOutput = execSync(`v-delete-web-domain ${EnviromentsClass.HESTIA_CP_USER} ${domain.domainName}`, {
                encoding: "utf-8",
            });
            if (removeWebDomainOutput.toLowerCase().includes("error")) {
                throw new BadRequestException(removeWebDomainOutput);
            }
        } catch (error) {
            throw new BadRequestException("حدث خطأ في Remove Web Domain");
        }

        //4: Remove Domain Doc
        await HandlersFactory.removeOneByPayload(this.storeDomainModel, { store: storeId, _id: domainId }, ErrorMessages.NO_DOMAIN_FOUND);

        //response
        return { message: "تم حذف النطاق بنجاح" };
    }
}
