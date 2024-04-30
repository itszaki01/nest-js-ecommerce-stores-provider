import { Module } from '@nestjs/common';
import { StoreSubController } from './store-sub.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from '../store/schema/store.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:Store.name,schema:StoreSchema}])],
  controllers: [StoreSubController],
})
export class StoreSubModule {}
