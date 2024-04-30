import { UnauthorizedException } from "@nestjs/common";
import * as twofactor from "node-2fa";
import { EnviromentsClass } from "src/utils/enviromentsClass";

export class TwoFactoryService {
    generace2FaSecret(email: string) {
        return twofactor.generateSecret({ name: EnviromentsClass.APP_NAME, account: email });
    }

    verify2Fa(token:string,login2FaCode:string) {
        const newToken = twofactor.generateToken(token);
        // => { token: '630618' }
        if(newToken?.token != login2FaCode){
            throw new UnauthorizedException('حدث خطأ ما يرجى التأكد من أن جميع المعلومات صحيحة')
        }
    }
}
