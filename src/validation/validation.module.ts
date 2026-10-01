import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ValidationService } from './validation.service';

@Module({
  imports: [ConfigModule],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}
