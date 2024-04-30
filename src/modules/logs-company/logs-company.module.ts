import { Global, Module } from "@nestjs/common";
import { LogsCompanyService } from "./logs-company.service";
import { LogsCompanyController } from "./logs-company.controller";
import { UserCompanyModule } from "../user-company/user-company.module";
import { MongooseModule } from "@nestjs/mongoose";
import { LogsCompany, LogsCompanySchema } from "./schema/logs-company.schema";
import { LogsCompanyCalcs, LogsCompanyCalcsSchema } from "./schema/logs-company-calcs.schema";
import { UserStopDeskModule } from "../user-stop-desk/user-stop-desk.module";

@Global()
@Module({
    imports: [
        UserCompanyModule,
        UserStopDeskModule,
        MongooseModule.forFeatureAsync([
            {
                name: LogsCompany.name,
                useFactory: () => {
                    const schema = LogsCompanySchema;
                    schema.pre(/^find/, function (next) {
                        //@ts-expect-error just bug
                        this.populate("userCompany", "name");
                        next();
                    });
                    return schema;
                },
            },
            {
                name: LogsCompanyCalcs.name,
                useFactory: () => {
                    const schema = LogsCompanyCalcsSchema;
                    schema.pre(/^find/, function (next) {
                        //@ts-expect-error just bug
                        this.populate("userCompany", "name");

                        //@ts-expect-error just bug
                        this.populate("userStopDesk", "stopDeskName");
                        next();
                    });

                    return schema;
                },
            },
        ]),
    ],
    controllers: [LogsCompanyController],
    providers: [LogsCompanyService],
    exports: [LogsCompanyService],
})
export class LogsCompanyModule {}
