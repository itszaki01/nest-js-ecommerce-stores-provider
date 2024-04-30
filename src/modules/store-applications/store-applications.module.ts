import { Module } from '@nestjs/common';
import { StoreApplicationsService } from './store-applications.service';
import { StoreApplicationsController } from './store-applications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreApplications, StoreApplicationsSchema } from './scheam/store-application.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:StoreApplications.name,schema:StoreApplicationsSchema}])],
  controllers: [StoreApplicationsController],
  providers: [StoreApplicationsService],
  exports:[]
})
export class StoreApplicationsModule {}
