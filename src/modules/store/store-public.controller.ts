import { Body, ClassSerializerInterceptor, Controller, Get, Post, Req, Res, UseInterceptors } from "@nestjs/common";
import { StoreService } from "./store.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { StoreDomainService } from "../store-domain/store-domain.service";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { StorePublicResponseDto } from "./dto/store-public-response.dto";
import parseMongoJSON from "src/utils/parseMongoJSON";
import { CompanyService } from "../company/company.service";
import { StorePublicSignUpDto } from "./dto/store-public-sign-up.dto";
import { SafirClickService } from "src/api/safir-click/safir-click.service";

@Controller("store-public")
export class StorePublicController {
    constructor(
        private readonly storeService: StoreService,
        private readonly storeDomainService: StoreDomainService,
        private readonly companyService: CompanyService,
        private readonly safirClickService: SafirClickService
    ) {}

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(@Req() req: FastifyRequest) {
        let domainName = req.hostname;
        let storeId;
        if (EnviromentsClass.NODE_ENV === "DEV") {
            domainName = "localhost";
            storeId = (await this.storeDomainService.findOneByPayload(domainName)).store;
        } else if (domainName.includes(`.${EnviromentsClass.COMPANY_BASE_DOMAIN}`)) {
            domainName = req.hostname.replace(`.${EnviromentsClass.COMPANY_BASE_DOMAIN}`, "");
            storeId = (await this.storeService.findOneByPayload({ storeSubDomain: domainName }))._id.toString();
        } else {
            storeId = (await this.storeDomainService.findOneByPayload(domainName)).store;
        }
        const storeSettingsPublic = await this.storeService.findOne(storeId);

        return new StorePublicResponseDto(parseMongoJSON(storeSettingsPublic));
    }

    @Post("signup")
    async signUpPublic(@Body() storePublicSignUpDto: StorePublicSignUpDto, @Res({ passthrough: true }) res: FastifyReply) {
        //1:check if company allow signup
        const compnay = await this.companyService.findeOne();
        if (!compnay.allowSignUp) {
            res.redirect(303, `https://admin.${EnviromentsClass.COMPANY_BASE_DOMAIN}`);
            return { error: "signup not allowed" };
        }

        //IF SAFIR-CLICK VALIDATE ACCESS   ***** SAFIR - CLICK *****
        if (EnviromentsClass.COMPNAY_ECO_SYSTEM === "safir-click") {
            //1: validate user is allowed to signUp
            const userId = await this.safirClickService.checkUserSignUp(storePublicSignUpDto.userEmail);
            //2: Create SafirClick Store With ApiKey1 = userId
            const user = await this.storeService.create(
                { ...storePublicSignUpDto, storeSubcreption: "basic", apiKey1: userId },
                EnviromentsClass.COMPNAY_FIXED_STOP_DESK_SIGN_UP_ID,
                false
            );
            return user;
        } else {
            //Create New Store
            const user = await this.storeService.create(
                { ...storePublicSignUpDto, storeSubcreption: "basic" },
                EnviromentsClass.COMPNAY_FIXED_STOP_DESK_SIGN_UP_ID,
                false
            );
            return user;
        }
    }
}
