import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ProviderController } from './provider.controller';
import { ProviderRepository } from './provider.repository';
import { ProviderService } from './provider.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [ProviderController],
  providers: [ProviderService, ProviderRepository],
  exports: [ProviderService, ProviderRepository],
})
export class ProviderModule {}
