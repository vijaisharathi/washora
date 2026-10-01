import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrivacyService } from './privacy.service';

@Module({
  imports: [ConfigModule],
  providers: [PrivacyService],
  exports: [PrivacyService],
})
export class PrivacyModule {}
