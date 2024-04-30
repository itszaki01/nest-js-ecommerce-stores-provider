import { Module } from '@nestjs/common';
import { AuthStoreUserService } from './auth-store-user.service';
import { AuthStoreUserController } from './auth-store-user.controller';
import { UserStoreModule } from '../user-store/user-store.module';

@Module({
  imports:[UserStoreModule],
  controllers: [AuthStoreUserController],
  providers: [AuthStoreUserService],
})
export class AuthStoreUserModule {}
