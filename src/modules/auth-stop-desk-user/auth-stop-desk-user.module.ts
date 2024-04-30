import { Module } from '@nestjs/common';
import { AuthStopDeskUserService } from './auth-stop-desk-user.service';
import { AuthStopDeskUserController } from './auth-stop-desk-user.controller';
import { UserStopDeskModule } from '../user-stop-desk/user-stop-desk.module';

@Module({
  imports:[UserStopDeskModule],
  controllers: [AuthStopDeskUserController],
  providers: [AuthStopDeskUserService],
})
export class AuthStopDeskUserModule {}
