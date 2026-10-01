import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SyntheticDatasetEngine,
  BookingStateMachineValidator,
  FinancialReconciliationEngine,
  TenantRoleIsolationValidator,
  JourneyRunner
} from './validation-core.mjs';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(private readonly configService: ConfigService) {}

  getSyntheticDataset() {
    const engine = new SyntheticDatasetEngine();
    return engine.getDataset();
  }

  generateTraceableIds(prefix?: string) {
    const engine = new SyntheticDatasetEngine();
    return engine.generateTraceableIds(prefix);
  }

  validateBookingTransition(fromState: string, toState: string) {
    const engine = new BookingStateMachineValidator();
    return engine.validateTransition(fromState, toState);
  }

  verifyFinancialReconciliation(record: {
    bookingTotal: number;
    paymentAmount: number;
    transactionAmount: number;
    refundAmount?: number;
    providerEarnings: number;
    deliveryEarnings: number;
    platformCommission: number;
  }) {
    const engine = new FinancialReconciliationEngine();
    return engine.verifyFinancialInvariants(record);
  }

  verifyRewardInvariants(account: { startingBalance: number; endingBalance: number }, earned: number, redeemed: number) {
    const engine = new FinancialReconciliationEngine();
    return engine.verifyRewardInvariants(account, earned, redeemed);
  }

  verifyTenantIsolation(requestingOrgId: string, resourceOrgId: string) {
    const engine = new TenantRoleIsolationValidator();
    return engine.verifyTenantIsolation(requestingOrgId, resourceOrgId);
  }

  verifyCustomerIsolation(requestingUserId: string, resourceUserId: string) {
    const engine = new TenantRoleIsolationValidator();
    return engine.verifyCustomerIsolation(requestingUserId, resourceUserId);
  }

  verifyProviderIsolation(requestingProviderId: string, resourceProviderId: string) {
    const engine = new TenantRoleIsolationValidator();
    return engine.verifyProviderIsolation(requestingProviderId, resourceProviderId);
  }

  verifyRolePermissions(userRole: string, requiredRole: string) {
    const engine = new TenantRoleIsolationValidator();
    return engine.verifyRolePermissions(userRole, requiredRole);
  }

  runJourney(journeyType: 'customer' | 'provider' | 'delivery' | 'operations' | 'admin' | 'e2e' | 'failure' | 'dispute' | 'recovery' | 'release' | 'smoke') {
    const runner = new JourneyRunner();
    switch (journeyType) {
      case 'customer': return runner.runCustomerJourney();
      case 'provider': return runner.runProviderJourney();
      case 'delivery': return runner.runDeliveryJourney();
      case 'operations': return runner.runOperationsJourney();
      case 'admin': return runner.runAdminJourney();
      case 'e2e': return runner.runCrossRoleEndToEndJourney();
      case 'failure': return runner.runFailureJourney();
      case 'dispute': return runner.runSupportDisputeJourney();
      case 'recovery': return runner.runRecoveryJourney();
      case 'release': return runner.runReleaseJourney();
      case 'smoke': return runner.runFinalProductionSmoke();
      default: return runner.runFinalProductionSmoke();
    }
  }
}
