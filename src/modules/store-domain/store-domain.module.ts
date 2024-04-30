import { Module } from "@nestjs/common";
import { StoreDomainService } from "./store-domain.service";
import { StoreDomainController } from "./store-domain.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { StoreDomain, StoreDomainSchema } from "./schema/store-domain.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: StoreDomain.name, schema: StoreDomainSchema }])],
    controllers: [StoreDomainController],
    providers: [StoreDomainService],
    exports: [StoreDomainService],
})
export class StoreDomainModule {}
