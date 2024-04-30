import { MiddlewareConsumer, Module, NestModule, RequestMethod, UseGuards } from "@nestjs/common";
import { CompanyModule } from "./modules/company/company.module";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { AllExceptionsFilter } from "./global/filters/all-exceptions.filter";
import { MongoModule } from "./modules/mongo/mongo.module";
import { ConfigModule } from "@nestjs/config";
import { UserCompanyModule } from "./modules/user-company/user-company.module";
import { UserStopDeskModule } from "./modules/user-stop-desk/user-stop-desk.module";
import { UserStoreModule } from "./modules/user-store/user-store.module";
import { AuthCompanyUserModule } from "./modules/auth-company-user/auth-company-user.module";
import { AuthStopDeskUserModule } from "./modules/auth-stop-desk-user/auth-stop-desk-user.module";
import { CommonModule } from "./common/common.module";
import { AuthStoreUserModule } from "./modules/auth-store-user/auth-store-user.module";
import { StoreModule } from "./modules/store/store.module";
import { StoreLocationModule } from "./modules/store-location/store-location.module";
import { StoreCategoryModule } from "./modules/store-category/store-category.module";
import { StoreProductModule } from "./modules/store-product/store-product.module";
import { StoreOrderModule } from "./modules/store-order/store-order.module";
import { StoreDomainModule } from "./modules/store-domain/store-domain.module";
import { StorePageModule } from "./modules/store-page/store-page.module";
import { ViewsModule } from "./modules/views/views.module";
import { SocialmediaConversionApiModule } from "./modules/socialmedia-conversion-api/socialmedia-conversion-api.module";
import { ApiModule } from "./api/api.module";
import { ValidateCsrfJwtMiddleWare } from "./global/middlewares/validate-csrf-jwt.middleware";
import { LogsStopDeskModule } from "./modules/logs-stop-desk/logs-stop-desk.module";
import { LogsCompanyModule } from "./modules/logs-company/logs-company.module";
import { StoreApplicationsModule } from "./modules/store-applications/store-applications.module";
import { LogsUserStoreModule } from "./modules/logs-user-store/logs-user-store.module";
import { UserConfirmationModule } from "./modules/user-confirmation/user-confirmation.module";
import { AuthUserConfirmationModule } from "./modules/auth-user-confirmation/auth-user-confirmatino.module";
import { StoreSubModule } from "./modules/store-sub/store-sub.module";
import { ThrottlerBehindProxyGuard } from "./global/guards/throttler-behind-proxy.guard";
import { ThrottlerModule, seconds } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";
import { EnviromentsClass } from "./utils/enviromentsClass";

@UseGuards(ThrottlerBehindProxyGuard)
@Module({
    imports: [
        CompanyModule,
        MongoModule,
        ConfigModule.forRoot(),
        UserCompanyModule,
        UserStopDeskModule,
        AuthStopDeskUserModule,
        UserStoreModule,
        AuthCompanyUserModule,
        CommonModule,
        AuthStoreUserModule,
        StoreModule,
        StoreLocationModule,
        StoreCategoryModule,
        StoreProductModule,
        StoreOrderModule,
        StoreDomainModule,
        StorePageModule,
        ViewsModule,
        SocialmediaConversionApiModule,
        ApiModule,
        LogsStopDeskModule,
        LogsCompanyModule,
        StoreApplicationsModule,
        LogsUserStoreModule,
        UserConfirmationModule,
        AuthUserConfirmationModule,
        StoreSubModule,
        ThrottlerModule.forRootAsync({
            useFactory: () => {
                if (EnviromentsClass.NODE_ENV === "DEV") {
                    return [{ limit: 10, ttl: seconds(6) }];
                } else {
                    return { throttlers: [{ limit: 10, ttl: seconds(6) }], storage: new ThrottlerStorageRedisService() };
                }
            },
        }),
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ValidateCsrfJwtMiddleWare).forRoutes({ path: "/*", method: RequestMethod.POST }, { path: "/*", method: RequestMethod.PATCH });
    }
}
