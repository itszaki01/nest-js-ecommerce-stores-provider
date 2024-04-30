import { Global, Module } from '@nestjs/common';
import { UserStoreService } from './user-store.service';
import { UserStoreController } from './user-store.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserStore, UserStoreSchema } from './schema/user-store.schema';
import { UserStorePublicController } from './user-store-public.controller';
import { StoreOrder, StoreOrderSchema } from '../store-order/schema/store-order.schema';

@Global()
@Module({
  imports:[MongooseModule.forFeature([{name:UserStore.name,schema:UserStoreSchema},{name:StoreOrder.name,schema:StoreOrderSchema}])],
  controllers: [UserStoreController,UserStorePublicController],
  providers: [UserStoreService],
  exports:[UserStoreService]
})
export class UserStoreModule {}
