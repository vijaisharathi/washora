import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { CustomerPaymentController } from './controllers/customer-payment.controller';
import { CustomerRefundController } from './controllers/customer-refund.controller';
import { CustomerTransactionController } from './controllers/customer-transaction.controller';
import { DeliveryPartnerEarningController } from './controllers/delivery-partner-earning.controller';
import { OperationsFinancialController } from './controllers/operations-financial.controller';
import { ProviderEarningController } from './controllers/provider-earning.controller';
import { FinancialRepository } from './repositories/financial.repository';
import { EarningsService } from './services/earnings.service';
import { FinancialSummaryService } from './services/financial-summary.service';
import { IdempotencyService } from './services/idempotency.service';
import { PaymentService } from './services/payment.service';
import { RefundService } from './services/refund.service';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [PrismaModule, AuthorizationModule],
  controllers: [
    CustomerPaymentController,
    CustomerTransactionController,
    CustomerRefundController,
    ProviderEarningController,
    DeliveryPartnerEarningController,
    OperationsFinancialController,
  ],
  providers: [
    FinancialRepository,
    IdempotencyService,
    PaymentService,
    TransactionService,
    RefundService,
    EarningsService,
    FinancialSummaryService,
  ],
  exports: [
    PaymentService,
    TransactionService,
    RefundService,
    EarningsService,
    FinancialSummaryService,
    FinancialRepository,
  ],
})
export class FinancialModule {}
