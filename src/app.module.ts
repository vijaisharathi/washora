import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ProviderModule } from './modules/provider/provider.module';
import { DeliveryPartnerModule } from './modules/delivery-partner/delivery-partner.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { BookingModule } from './modules/booking/booking.module';
import { OperationsModule } from './modules/operations/operations.module';
import { FinancialModule } from './modules/financial/financial.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SupportModule } from './modules/support/support.module';
import { AdminModule } from './modules/admin/admin.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrivacyModule } from './privacy/privacy.module';
import { ValidationModule } from './validation/validation.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    HealthModule,
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
    AdminModule,
    IntegrationsModule,
    AnalyticsModule,
    PrivacyModule,
    ValidationModule,

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: (config.get<number>('security.rateLimitTtl', 60) || 60) * 1000,
          limit: config.get<number>('security.rateLimitMax', 100) || 100,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
