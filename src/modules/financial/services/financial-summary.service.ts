import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  CustomerPaymentSummaryDto,
  EarningSummaryDto,
  OperationsFinancialSummaryDto,
} from '../dto';
import { FinancialRepository } from '../repositories/financial.repository';
import { FinancialErrorCode } from '../types/financial.types';

@Injectable()
export class FinancialSummaryService {
  constructor(private readonly financialRepo: FinancialRepository) {}

  /**
   * Aggregate customer payments, refunds, and pending liabilities
   */
  async getCustomerPaymentSummary(
    organizationId: string,
    customerUserId: string,
  ): Promise<CustomerPaymentSummaryDto> {
    const customer = await this.financialRepo.findCustomerByUserId(customerUserId);
    if (!customer) {
      throw new ForbiddenException({
        code: FinancialErrorCode.PAYMENT_ACCESS_DENIED,
        message: 'Customer profile required.',
      });
    }

    return this.financialRepo.getCustomerPaymentSummary(organizationId, customer.id);
  }

  /**
   * Aggregate provider earnings breakdown
   */
  async getProviderEarningSummary(
    organizationId: string,
    providerUserId: string,
  ): Promise<EarningSummaryDto> {
    const provider = await this.financialRepo.findProviderByUserId(providerUserId);
    if (!provider) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'Provider profile required.',
      });
    }

    return this.financialRepo.getEarningSummary(organizationId, {
      providerId: provider.id,
    });
  }

  /**
   * Aggregate delivery partner earnings breakdown
   */
  async getDeliveryPartnerEarningSummary(
    organizationId: string,
    deliveryPartnerUserId: string,
  ): Promise<EarningSummaryDto> {
    const deliveryPartner = await this.financialRepo.findDeliveryPartnerByUserId(
      deliveryPartnerUserId,
    );
    if (!deliveryPartner) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'Delivery partner profile required.',
      });
    }

    return this.financialRepo.getEarningSummary(organizationId, {
      deliveryPartnerId: deliveryPartner.id,
    });
  }

  /**
   * Aggregate organization-level operations financial overview
   */
  async getOperationsFinancialSummary(
    organizationId: string,
  ): Promise<OperationsFinancialSummaryDto> {
    return this.financialRepo.getOperationsFinancialSummary(organizationId);
  }
}
