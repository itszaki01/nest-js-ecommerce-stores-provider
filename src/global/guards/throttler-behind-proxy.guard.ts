import { ThrottlerGuard } from "@nestjs/throttler";
import { Injectable } from "@nestjs/common";
import { FastifyRequest } from "fastify";

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected async getTracker(req: FastifyRequest): Promise<string> {
        return req.headers["x-real-ip"] ? (req.headers["x-real-ip"] as string) : req.ip; // individualize IP extraction to meet your own needs
    }
}
