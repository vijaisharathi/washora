import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { BookingModule } from '../booking/booking.module';
import { DeliveryPartnerModule } from '../delivery-partner/delivery-partner.module';
import { ProviderModule } from '../provider/provider.module';
import { AssignmentController } from './assignment/assignment.controller';
import { AssignmentEligibilityService } from './assignment/assignment-eligibility.service';
import { AssignmentRepository } from './assignment/assignment.repository';
import { AssignmentService } from './assignment/assignment.service';
import { DeliveryPartnerAssignmentController } from './assignment/delivery-partner-assignment.controller';
import { ProviderAssignmentController } from './assignment/provider-assignment.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuthorizationModule,
    ProviderModule,
    DeliveryPartnerModule,
    BookingModule,
  ],
  controllers: [
    AssignmentController,
    ProviderAssignmentController,
    DeliveryPartnerAssignmentController,
  ],
  providers: [
    AssignmentService,
    AssignmentRepository,
    AssignmentEligibilityService,
  ],
  exports: [
    AssignmentService,
    AssignmentRepository,
    AssignmentEligibilityService,
  ],
})
export class OperationsModule {}
