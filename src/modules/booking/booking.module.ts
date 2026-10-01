import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { CatalogModule } from '../catalog/catalog.module';
import { CustomerModule } from '../customer/customer.module';
import { ProviderModule } from '../provider/provider.module';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { CustomerBookingController } from './customer-booking.controller';
import { ProviderBookingController } from './provider-booking.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuthorizationModule,
    CustomerModule,
    CatalogModule,
    ProviderModule,
  ],
  controllers: [CustomerBookingController, ProviderBookingController],
  providers: [BookingService, BookingRepository],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
