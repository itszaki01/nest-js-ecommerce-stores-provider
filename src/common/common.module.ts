import { Global, Module } from '@nestjs/common';
import { JwtTokenService } from './services/jwtToken.service';
import { BcryptService } from './services/bcrypt.service';
import { TwoFactoryService } from './services/twoFactory.service';
import { CompanyModule } from 'src/modules/company/company.module';
import { MailService } from './services/mail.service';

@Global()
@Module({
    imports:[CompanyModule],
    providers:[JwtTokenService,BcryptService,TwoFactoryService,MailService],
    exports:[JwtTokenService,BcryptService,TwoFactoryService,MailService]
})
export class CommonModule {}
