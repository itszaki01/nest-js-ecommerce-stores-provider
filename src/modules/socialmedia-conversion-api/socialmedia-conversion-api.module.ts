import { Module } from '@nestjs/common';
import { SocialmediaConversionApiService } from './socialmedia-conversion-api.service';

@Module({
  controllers: [],
  providers: [SocialmediaConversionApiService],
  exports:[SocialmediaConversionApiService]
})
export class SocialmediaConversionApiModule {}
