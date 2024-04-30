import { BadRequestException, Injectable } from "@nestjs/common";
import { SignInCompanyUserDto } from "./dto/sign-in-company-user.dto";
import { SignUpCompanyUserDto } from "./dto/sign-up-company-user.dto";
import { UserCompanyService } from "../user-company/user-company.service";

import parseMongoJSON from "../../utils/parseMongoJSON";
import { JwtTokenService } from "../../common/services/jwtToken.service";
import { BcryptService } from "../../common/services/bcrypt.service";
import { TwoFactoryService } from "../../common/services/twoFactory.service";
import { EnviromentsClass } from "../../utils/enviromentsClass";
import { TQueryParams } from "src/@types/QueryParams.type";

@Injectable()
export class AuthCompanyUserService {
    constructor(
        private readonly userCompnayService: UserCompanyService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly bcryptService: BcryptService,
        private readonly twoFactoryService: TwoFactoryService,
    ) {}

    async signIn(signInCompanyUserDto: SignInCompanyUserDto) {
        //1: Check if Company User is Exist by Email
        const userCompanyAccount = await this.userCompnayService.findOneByEmail(signInCompanyUserDto.email);
        if (!userCompanyAccount) {
            throw new BadRequestException("البريد الإلكتروني أو كلمة السر خاطئة");
        }

        //2: Check if 2Fa Code is Match
        if (EnviromentsClass.NODE_ENV === "PROD") {
            this.twoFactoryService.verify2Fa(userCompanyAccount.twoFactorySecretCode, signInCompanyUserDto.twoFactoryLoginCode);
        }

        //3: Check if PasswordMatch
        await this.bcryptService.compare(signInCompanyUserDto.password, userCompanyAccount.password);

        //4: Assaign new Token
        const token = this.jwtTokenService.signJWT({ userId: userCompanyAccount._id.toString() }, EnviromentsClass.JWT_AFFLITA_USER_COMPANY_SECRET);

        //5: Response With token
        return {
            ...parseMongoJSON(userCompanyAccount),
            token,
        };
    }

    async signUp(signUpCompanyUserDto: SignUpCompanyUserDto) {
        //1: Check if there is any user Exist
        const companyUsers = await this.userCompnayService.findAll({} as TQueryParams);
        if (companyUsers.documents.length >= 1) {
            throw new BadRequestException("لايمكن تسجيل أكثر من مالك واحد");
        }

        //2: Create the Account
        const userCompanyAccount = await this.userCompnayService.create({
            ...signUpCompanyUserDto,
            role: "CompanyOwner",
        });

        //3: Generate Token
        const token = this.jwtTokenService.signJWT({ userId: userCompanyAccount._id.toString() }, EnviromentsClass.JWT_AFFLITA_USER_COMPANY_SECRET);

        //4: Response with token
        return {
            ...parseMongoJSON(userCompanyAccount),
            token,
        };
    }
}
