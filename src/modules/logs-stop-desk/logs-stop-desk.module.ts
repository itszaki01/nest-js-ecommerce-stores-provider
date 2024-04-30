import { Global, Module } from "@nestjs/common";
import { LogsStopDeskService } from "./logs-stop-desk.service";
import { LogsStopDeskController } from "./logs-stop-desk.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { LogsStopDesk, LogsStopDeskSchema } from "./schema/logs-stop-desk.schema";
import { UserStopDeskModule } from "../user-stop-desk/user-stop-desk.module";
import { LogsStopDeskCalcs, LogsStopDeskCalcsSchema } from "./schema/logs-stop-desk-calcs.schema";


@Global()
@Module({
    imports: [
        UserStopDeskModule,
        MongooseModule.forFeatureAsync([
            {
                name: LogsStopDesk.name,
                useFactory: () => {
                    const schema = LogsStopDeskSchema;
                    schema.pre(/^find/, function (next) {
                        //@ts-expect-error just bug
                        this.populate("store", "storeSubDomain");

                        //@ts-expect-error just bug
                        this.populate("userStopDesk", "stopDeskName");
                        next();
                    });
                    return schema;
                },
            },
            {
                name: LogsStopDeskCalcs.name,
                useFactory: () => {
                    const schema = LogsStopDeskCalcsSchema;
                    schema.pre(/^find/, function (next) {
                        //@ts-expect-error just bug
                        this.populate("store", "storeSubDomain");

                        //@ts-expect-error just bug
                        this.populate("userStopDesk", "stopDeskName");
                        next();
                    });
                    return schema;
                },
            },
        ]),
    ],
    controllers: [LogsStopDeskController],
    providers: [LogsStopDeskService],
    exports: [LogsStopDeskService],
})
export class LogsStopDeskModule {}
