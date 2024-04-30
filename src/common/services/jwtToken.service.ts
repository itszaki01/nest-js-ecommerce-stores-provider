import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { v4 as uuidv4 } from "uuid";
@Injectable()
export class JwtTokenService {
    signJWT(payload: { userId: string; role?: string; storeId?: string }, JWT_SECRET_KEY: string) {
        return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: EnviromentsClass.JWT_EXP });
    }

    signResetPasswordJWT(payload: { userId: string; role?: string; storeId?: string }, JWT_SECRET_KEY: string) {
        return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "10m" });
    }

    verifyJWT(token: string, JWT_SECRET_KEY: string) {
        return jwt.verify(token, JWT_SECRET_KEY) as { userId: string; role?: string; storeId?: string; exp: number; init: number };
    }

    signCsrfJWT() {
        return jwt.sign({ sessionId: uuidv4() }, "@fisf@@!)R_LSJPFJ@(PF#!)_(F !#F(#!)(_19fj230o2ihf022#(P$231u721f", {
            expiresIn: `${Math.trunc(Math.random() * 10) + 20}s`,
        });
    }

    verifyCsrfJWT(token: string) {
        return jwt.verify(token, "@fisf@@!)R_LSJPFJ@(PF#!)_(F !#F(#!)(_19fj230o2ihf022#(P$231u721f") as {
            sessionId: string;
            exp: number;
            init: number;
        };
    }
}
