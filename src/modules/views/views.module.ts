import { Module } from '@nestjs/common';
import { ViewsController } from './views.controller';
import { ViewsService } from './views.service';
import { StoreModule } from '../store/store.module';
import { StoreDomainModule } from '../store-domain/store-domain.module';

@Module({
  imports:[StoreModule,StoreDomainModule],
  controllers: [ViewsController],
  providers: [ViewsService],
})
export class ViewsModule {}
