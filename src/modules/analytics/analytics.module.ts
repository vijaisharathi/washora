import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';

// Services
import { AnalyticsEventService } from './services/analytics-event.service';
import { KpiEngineService } from './services/kpi-engine.service';
import { FunnelAnalyticsService } from './services/funnel-analytics.service';
import { ExperimentService } from './services/experiment.service';
import { ImprovementService } from './services/improvement.service';
import { AnalyticsExportService } from './services/analytics-export.service';
import { DataQualityService } from './services/data-quality.service';

// Controllers
import { AnalyticsEventController } from './controllers/analytics-event.controller';
import { CustomerAnalyticsController } from './controllers/customer-analytics.controller';
import { ProviderAnalyticsController } from './controllers/provider-analytics.controller';
import { DeliveryAnalyticsController } from './controllers/delivery-analytics.controller';
import { OperationsAnalyticsController } from './controllers/operations-analytics.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { ExperimentController } from './controllers/experiment.controller';
import { ImprovementController } from './controllers/improvement.controller';
import { AnalyticsExportController } from './controllers/analytics-export.controller';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [
    AnalyticsEventController,
    CustomerAnalyticsController,
    ProviderAnalyticsController,
    DeliveryAnalyticsController,
    OperationsAnalyticsController,
    AdminAnalyticsController,
    ExperimentController,
    ImprovementController,
    AnalyticsExportController,
  ],
  providers: [
    AnalyticsEventService,
    KpiEngineService,
    FunnelAnalyticsService,
    ExperimentService,
    ImprovementService,
    AnalyticsExportService,
    DataQualityService,
  ],
  exports: [
    AnalyticsEventService,
    KpiEngineService,
    FunnelAnalyticsService,
    ExperimentService,
    ImprovementService,
    AnalyticsExportService,
    DataQualityService,
  ],
})
export class AnalyticsModule {}
