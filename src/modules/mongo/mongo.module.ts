import {  Module, OnModuleInit } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EnviromentsClass } from "src/utils/enviromentsClass";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: () => {
                return { uri: EnviromentsClass.DB_URI };
            },
        }),
    ],
})
export class MongoModule implements OnModuleInit {

    onModuleInit() {
      console.log('Mongoose connected successfully');
    }
}
