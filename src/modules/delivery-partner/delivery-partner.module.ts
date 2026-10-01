import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { DeliveryPartnerController } from './delivery-partner.controller';
import { DeliveryPartnerRepository } from './delivery-partner.repository';
import { DeliveryPartnerService } from './delivery-partner.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [DeliveryPartnerController],
  providers: [DeliveryPartnerService, DeliveryPartnerRepository],
  exports: [DeliveryPartnerService, DeliveryPartnerRepository],
})
export class DeliveryPartnerModule {}
