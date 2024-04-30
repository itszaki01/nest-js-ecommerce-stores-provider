import { Controller, Get, Body, Patch, OnModuleInit } from "@nestjs/common";
import { StoreService } from "./store.service";
import { UpdateStoreDto } from "./dto/update-store.dto";
import { ParseMongoIdPipe } from "../mongo/pipes/parse-mongo-id.pipe";
import { UserStoreAuth } from "../auth-store-user/decorator/user-store-auth.decorator";
import { StoreUser } from "../auth-store-user/decorator/store-user.decorator";
import { ProColiService } from "src/api/pro-coli/pro-coli.service";
import { CompanyService } from "../company/company.service";
import readMasterClusterFile from "src/utils/readMasterClasterFile";
import writeIsMasterCluster from "src/utils/isMasterCluster";
import { EnviromentsClass } from "src/utils/enviromentsClass";
import { InjectModel } from "@nestjs/mongoose";
import { Store } from "./schema/store.schema";
import { Model } from "mongoose";
import { EcoTrackService } from "src/api/eco-track/eco-track.service";

@UserStoreAuth("all")
@Controller("store/user-store")
export class StoreUserController implements OnModuleInit {
    constructor(
        private readonly storeService: StoreService,
        private readonly procoliService: ProColiService,
        private readonly ecoTrackService:EcoTrackService,
        private readonly companyService: CompanyService,
        @InjectModel(Store.name) private storeModel: Model<Store>
    ) {}

    async onModuleInit() {
        // Tracking Orders Service
        if (readMasterClusterFile() === "true") {
            writeIsMasterCluster("false");
            //1:Get Company
            const company = await this.companyService.findeOne();
            
            //2:Check if its Allow AutoTracking
            if (company.allowOrdersAutoTracking) {
                if (EnviromentsClass.COMPNAY_ECO_SYSTEM === "pro-coli") {
                    this.procoliService.autoTrackingLoop();
                }else if(EnviromentsClass.COMPNAY_ECO_SYSTEM === 'eco-track'){
                    this.ecoTrackService.autoTrackingLoop()
                }
            }
            
            //Interval Subscreptions
            setInterval(async () => {
                const company2 = await this.companyService.findeOne();
                if (company2.dailyCheckerDate.getDate() != new Date(Date.now()).getDate()) {
                    await this.storeService.subscreptionsDecreaserInterval();
                    await this.storeService.subscreptionsCheckerInterval();
                }
                company2.dailyCheckerDate = new Date(Date.now());
                await company2.save();
            }, 5000);
        }
    }

    @Get()
    findOne(@StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeService.findOne(storeId);
    }

    @Patch("")
    @UserStoreAuth("StoreAdmin")
    update(@StoreUser("storeId", ParseMongoIdPipe) storeId: string, @Body() updateStoreDto: UpdateStoreDto) {
        return this.storeService.update(storeId, updateStoreDto);
    }

    @Patch("reset-settings")
    @UserStoreAuth("StoreAdmin")
    resetDefualtSettings(@StoreUser("storeId", ParseMongoIdPipe) storeId: string) {
        return this.storeService.resetDefualtSettings(storeId);
    }
}
