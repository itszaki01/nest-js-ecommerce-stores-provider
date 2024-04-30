import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class BcryptService {
    async hash(password: string) {
        return await bcrypt.hash(password, 12);
    }

    async compare(password: string, encryptedValue: string) {
        const isPasswdMatch = await bcrypt.compare(password, encryptedValue);
        if (!isPasswdMatch) {
            throw new NotFoundException("البريد الإلكتروني أو كلمة السر خاطئة");
        }
    }
}
