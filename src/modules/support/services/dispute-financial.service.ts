import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Dispute, DisputeOutcome, DisputeStatus, Prisma } from '@prisma/client';
import { RefundService } from '../../financial/services/refund.service';
import { ResolveDisputeDto } from '../dto';
import { SupportRepository } from '../repositories/support.repository';
import {
  DisputeResolutionType,
  SupportAuditAction,
  SupportErrorCode,
} from '../types/support.types';

@Injectable()
export class DisputeFinancialService {
  private readonly logger = new Logger(DisputeFinancialService.name);

  constructor(
    private readonly supportRepo: SupportRepository,
    private readonly refundService: RefundService,
  ) {}

  /**
   * Executes financially safe dispute resolution.
   * If a financial action (FULL_REFUND / PARTIAL_REFUND) is requested:
   * B14 delegates strictly to B10 RefundService.
   * B14 never directly writes into payments, refunds, or transactions.
   * If the financial transaction fails, dispute resolution is aborted.
   */
  async executeDisputeResolution(
    organizationId: string,
    dispute: Dispute & { booking?: any; payment?: any },
    dto: ResolveDisputeDto,
    operatorUserId: string,
    idempotencyKey?: string,
  ): Promise<Dispute> {
    const isFinancial =
      dto.resolutionType === 'FULL_REFUND' ||
      dto.resolutionType === 'PARTIAL_REFUND';

    if (!isFinancial) {
      // Non-financial resolution
      let outcome: DisputeOutcome = DisputeOutcome.DISMISSED;
      if (dto.resolutionType === 'SERVICE_REDO') outcome = DisputeOutcome.RE_SERVICE;
      else if (dto.resolutionType === 'CREDIT') outcome = DisputeOutcome.COUPON_CREDIT;
      else if (dto.resolutionType === 'NO_ACTION') outcome = DisputeOutcome.DISMISSED;
      else outcome = DisputeOutcome.DISMISSED;

      return this.supportRepo.resolveDispute(
        organizationId,
        dispute.id,
        {
          resolutionType: dto.resolutionType as DisputeResolutionType,
          resolutionNote: dto.resolutionNote,
          outcome,
        },
        dispute.status,
        operatorUserId,
      );
    }

    // Financial Resolution: Validate referenced payment
    let payment = dispute.payment;
    if (!payment && dispute.bookingId) {
      const booking = await this.supportRepo.findBookingByIdentifier(
        organizationId,
        dispute.bookingId,
      );
      payment = booking?.payment;
    }

    if (!payment) {
      throw new BadRequestException({
        code: SupportErrorCode.FINANCIAL_RESOLUTION_FAILED,
        message:
          'Cannot execute financial refund resolution because no payment is associated with this booking.',
      });
    }

    let refundAmountStr = dto.amount;
    if (dto.resolutionType === 'FULL_REFUND' && !refundAmountStr) {
      refundAmountStr = payment.amount.toFixed(2);
    }

    if (!refundAmountStr || parseFloat(refundAmountStr) <= 0) {
      throw new BadRequestException({
        code: SupportErrorCode.FINANCIAL_RESOLUTION_FAILED,
        message: 'A valid refund amount greater than zero is required for financial dispute resolution.',
      });
    }

    this.logger.log(
      `Executing B10 financial refund for dispute ${dispute.publicId}: amount=${refundAmountStr} ${dispute.currency}`,
    );

    let refundResult;
    try {
      // Delegate to B10 RefundService
      refundResult = await this.refundService.createRefund(
        payment.id,
        {
          amount: refundAmountStr,
          reason: `Dispute ${dispute.publicId} resolution: ${dto.resolutionNote}`,
          currency: dispute.currency || payment.currency,
        },
        organizationId,
        operatorUserId,
        idempotencyKey ? `dispute-refund-${idempotencyKey}` : undefined,
      );
    } catch (err: any) {
      this.logger.error(
        `Financial resolution failed for dispute ${dispute.publicId}: ${err.message}`,
        err.stack,
      );

      // B14 critical rule: A dispute cannot be marked RESOLVED if the financial action failed!
      throw new BadRequestException({
        code: SupportErrorCode.FINANCIAL_RESOLUTION_FAILED,
        message: `Financial refund failed: ${err.message || 'Refund processing rejected by ledger service.'}`,
      });
    }

    const resolvedAmount = new Prisma.Decimal(refundResult.amount);
    const outcome =
      dto.resolutionType === 'FULL_REFUND'
        ? DisputeOutcome.FULL_REFUND
        : DisputeOutcome.PARTIAL_REFUND;

    // Transition dispute to RESOLVED after verified financial success
    const resolvedDispute = await this.supportRepo.resolveDispute(
      organizationId,
      dispute.id,
      {
        resolutionType: dto.resolutionType as DisputeResolutionType,
        resolutionNote: dto.resolutionNote,
        resolvedAmount,
        outcome,
      },
      dispute.status,
      operatorUserId,
    );

    // Record audit event for financial resolution linkage
    await this.supportRepo.recordAuditEvent(
      organizationId,
      operatorUserId,
      'DISPUTE_FINANCIAL_RESOLUTION_COMPLETED',
      'Dispute',
      dispute.id,
      {
        disputePublicId: dispute.publicId,
        refundId: refundResult.id,
        refundPublicId: refundResult.publicId,
        amount: refundAmountStr,
        currency: dispute.currency,
      },
    );

    return resolvedDispute;
  }
}
