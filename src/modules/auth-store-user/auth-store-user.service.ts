import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SignInStoreUserDto } from "./dto/sign-in-store-user.dto";
import { BcryptService } from "src/common/services/bcrypt.service";
import { JwtTokenService } from "src/common/services/jwtToken.service";
import { UserStoreService } from "../user-store/user-store.service";
import parseMongoJSON from "src/utils/parseMongoJSON";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { StoreService } from "../store/store.service";

@Injectable()
export class AuthStoreUserService {
    constructor(
        private readonly bcryptService: BcryptService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly userStoreService: UserStoreService,
        private readonly storeService:StoreService
    ) {}
    async signIn(signInStoreUserDto: SignInStoreUserDto) {
        //1: Check if User is Exist
        const storeUser = await this.userStoreService.findOneByEmail(signInStoreUserDto.email);

        //2:check if store is active
        const store = await this.storeService.findOne(storeUser.store);
        if (!store.isActive) {
            throw new UnauthorizedException("المتجر غير مفعل");
        }

        //3: Compare Password
        await this.bcryptService.compare(signInStoreUserDto.password, storeUser.password);

        //4:Generate Token
        const token = this.jwtTokenService.signJWT(
            { userId: storeUser._id.toString(), role: storeUser.role, storeId: storeUser.store },
            EnviromentsClass.JWT_AFFLITA_USER_STORE_SECRET
        );

        //5:Response
        return {
            ...parseMongoJSON(storeUser),
            token,
        };
    }
}
