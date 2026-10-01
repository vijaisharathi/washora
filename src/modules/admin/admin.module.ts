import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { BookingModule } from '../booking/booking.module';
import { CatalogModule } from '../catalog/catalog.module';
import { CustomerModule } from '../customer/customer.module';
import { DeliveryPartnerModule } from '../delivery-partner/delivery-partner.module';
import { FinancialModule } from '../financial/financial.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OperationsModule } from '../operations/operations.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { ProviderModule } from '../provider/provider.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { SupportModule } from '../support/support.module';
import { AdminRepository } from './admin.repository';
import {
  AdminAssignmentController,
  AdminAuditController,
  AdminBookingController,
  AdminCatalogController,
  AdminCustomerController,
  AdminDashboardController,
  AdminDeliveryController,
  AdminDisputeController,
  AdminFinancialController,
  AdminMembersController,
  AdminNotificationController,
  AdminOrganizationController,
  AdminProviderController,
  AdminReportController,
  AdminReviewController,
  AdminSearchController,
  AdminSupportController,
  AdminUsersController,
} from './controllers';
import {
  AdminAssignmentService,
  AdminAuditService,
  AdminBookingService,
  AdminCatalogService,
  AdminCustomerService,
  AdminDashboardService,
  AdminDeliveryService,
  AdminDisputeService,
  AdminFinancialService,
  AdminMembersService,
  AdminNotificationService,
  AdminOrganizationService,
  AdminProviderService,
  AdminReportService,
  AdminReviewService,
  AdminSearchService,
  AdminSupportService,
  AdminUsersService,
} from './services';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuthorizationModule,
    CustomerModule,
    ProviderModule,
    DeliveryPartnerModule,
    CatalogModule,
    BookingModule,
    OperationsModule,
    FinancialModule,
    PromotionsModule,
    ReviewsModule,
    NotificationsModule,
    SupportModule,
  ],
  controllers: [
    AdminOrganizationController,
    AdminMembersController,
    AdminUsersController,
    AdminCustomerController,
    AdminProviderController,
    AdminDeliveryController,
    AdminBookingController,
    AdminAssignmentController,
    AdminCatalogController,
    AdminFinancialController,
    AdminReviewController,
    AdminNotificationController,
    AdminSupportController,
    AdminDisputeController,
    AdminDashboardController,
    AdminSearchController,
    AdminAuditController,
    AdminReportController,
  ],
  providers: [
    AdminRepository,
    AdminAuditService,
    AdminOrganizationService,
    AdminMembersService,
    AdminUsersService,
    AdminCustomerService,
    AdminProviderService,
    AdminDeliveryService,
    AdminBookingService,
    AdminAssignmentService,
    AdminCatalogService,
    AdminFinancialService,
    AdminReviewService,
    AdminNotificationService,
    AdminSupportService,
    AdminDisputeService,
    AdminDashboardService,
    AdminSearchService,
    AdminReportService,
  ],
  exports: [
    AdminRepository,
    AdminAuditService,
    AdminOrganizationService,
    AdminMembersService,
    AdminUsersService,
    AdminCustomerService,
    AdminProviderService,
    AdminDeliveryService,
    AdminBookingService,
    AdminAssignmentService,
    AdminCatalogService,
    AdminFinancialService,
    AdminReviewService,
    AdminNotificationService,
    AdminSupportService,
    AdminDisputeService,
    AdminDashboardService,
    AdminSearchService,
    AdminReportService,
  ],
})
export class AdminModule {}
