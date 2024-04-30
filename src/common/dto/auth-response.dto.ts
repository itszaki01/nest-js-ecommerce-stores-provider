import { Exclude } from "class-transformer";
import parseMongoJSON from "src/utils/parseMongoJSON";

export class AuthResponseDto<T> {
    @Exclude()
    password: string;

    @Exclude()
    passwordChangedAt:Date

    @Exclude()
    twoFactorySecretCode:string

    @Exclude()
    twoFactoryQr:string
    
    constructor(partiel: Partial<T>) {
        Object.assign(this, parseMongoJSON(partiel));
    }
}
