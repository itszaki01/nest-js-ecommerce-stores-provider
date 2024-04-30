import { Module } from '@nestjs/common';
import { UserConfirmationModule } from '../user-confirmation/user-confirmation.module';
import { AuthUserConfirmationController } from './auth-user-confirmatino.controller';
import { AuthUserConfirmationService } from './auth-user-confirmatino.service';


@Module({
  imports:[UserConfirmationModule],
  controllers: [AuthUserConfirmationController],
  providers: [AuthUserConfirmationService],
})
export class AuthUserConfirmationModule {}
