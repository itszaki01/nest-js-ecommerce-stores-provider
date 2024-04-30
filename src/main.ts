import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { WarpDataInterceptor } from "./global/interceptors/warp-data.interceptor";
import { join } from "path";
import { EnviromentsClass } from "./utils/enviromentsClass";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import { ClusteringService } from "./global/services/clustering-.service";
import writeIsMasterCluster from "./utils/isMasterCluster";
import axios from "axios";
import * as https from "https";

// UPDTERS
async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ bodyLimit: 20000 }));
    // await app.register(helmet)
    app.enableCors();

    axios.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    //@ts-expect-error Last Version Bug
    await app.register(fastifyCookie, {
        secret: EnviromentsClass.JWT_AFFLITA_USER_STORE_SECRET, // for cookies signature
    });

    //@ts-expect-error Last Version Bug
    await app.register(fastifyStatic, {
        root: join(__dirname, "..", "public_html"),
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            // forbidUnknownValues: true,
            enableDebugMessages: true,
            validateCustomDecorators: true,
        })
    );

    app.useGlobalInterceptors(new WarpDataInterceptor());
    app.setGlobalPrefix("v1", {
        exclude: [
            "/",
            "/page/:pageId",
            "/p/:productSlug",
            "/thankyou",
            "/manage",
            "/manage/*",
            "/desk",
            "/desk/*",
            "/company-admin",
            "/company-admin/*",
            "/confirmation-service",
            "/confirmation-service/*",
            "signup",
        ],
    });

    //Rejection Handler
    process.on("unhandledRejection", (err: Error) => {
        console.log(
            `\n -----------------------------------------
            \n => Unhandled Error: ${err}
            \n -----------------------------------------
            \n => Message: ${err.message}
            \n -----------------------------------------
            \n => Stack ${err.stack}
            \n -----------------------------------------`
        );
    });
    await app.listen(8000);
}

// Clustering
if (EnviromentsClass.NODE_ENV === "DEV") {
    writeIsMasterCluster("true");
    bootstrap();
} else {
    ClusteringService.startCluster(bootstrap);
}
