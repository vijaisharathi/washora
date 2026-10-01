import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccessibilityService } from './accessibility.service';

@Module({
  imports: [ConfigModule],
  providers: [AccessibilityService],
  exports: [AccessibilityService],
})
export class AccessibilityModule {}
