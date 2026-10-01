import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { FinancialModule } from '../financial/financial.module';
import { CustomerSupportController } from './controllers/customer-support.controller';
import { DeliveryPartnerSupportController } from './controllers/delivery-partner-support.controller';
import { OperationsSupportController } from './controllers/operations-support.controller';
import { ProviderSupportController } from './controllers/provider-support.controller';
import { SupportRepository } from './repositories/support.repository';
import { DisputeEvidenceService } from './services/dispute-evidence.service';
import { DisputeFinancialService } from './services/dispute-financial.service';
import { DisputeService } from './services/dispute.service';
import { EvidenceStorageService } from './services/evidence-storage.service';
import { SupportMessageService } from './services/support-message.service';
import { SupportTicketService } from './services/support-ticket.service';

@Module({
  imports: [PrismaModule, AuthorizationModule, FinancialModule],
  controllers: [
    CustomerSupportController,
    ProviderSupportController,
    DeliveryPartnerSupportController,
    OperationsSupportController,
  ],
  providers: [
    SupportRepository,
    EvidenceStorageService,
    SupportTicketService,
    SupportMessageService,
    DisputeService,
    DisputeEvidenceService,
    DisputeFinancialService,
  ],
  exports: [
    SupportRepository,
    EvidenceStorageService,
    SupportTicketService,
    SupportMessageService,
    DisputeService,
    DisputeEvidenceService,
    DisputeFinancialService,
  ],
})
export class SupportModule {}
