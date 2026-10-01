import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Earning,
  EarningStatus,
  EarningTransaction,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  AdjustEarningDto,
  EarningListQueryDto,
  EarningResponseDto,
  EarningTransactionResponseDto,
} from '../dto';
import { FinancialRepository } from '../repositories/financial.repository';
import { FinancialErrorCode } from '../types/financial.types';

@Injectable()
export class EarningsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialRepo: FinancialRepository,
  ) {}

  mapEarningTransactionToDto(et: EarningTransaction): EarningTransactionResponseDto {
    return {
      id: et.id,
      earningId: et.earningId,
      organizationId: et.organizationId,
      transactionId: et.transactionId,
      type: et.type,
      amount: et.amount.toFixed(2),
      currency: et.currency,
      notes: et.notes,
      createdAt: et.createdAt,
    };
  }

  mapEarningToDto(
    earning: Earning & { transactions?: EarningTransaction[] },
  ): EarningResponseDto {
    return {
      id: earning.id,
      publicId: earning.publicId,
      organizationId: earning.organizationId,
      bookingId: earning.bookingId,
      providerId: earning.providerId,
      deliveryPartnerId: earning.deliveryPartnerId,
      grossAmount: earning.grossAmount.toFixed(2),
      platformFee: earning.platformFee.toFixed(2),
      taxWithheld: earning.taxWithheld.toFixed(2),
      netAmount: earning.netAmount.toFixed(2),
      currency: earning.currency,
      status: earning.status,
      payoutDate: earning.payoutDate,
      payoutRef: earning.payoutRef,
      transactions: earning.transactions
        ? earning.transactions.map((t) => this.mapEarningTransactionToDto(t))
        : undefined,
      createdAt: earning.createdAt,
      updatedAt: earning.updatedAt,
    };
  }

  /**
   * Generates earnings for completed bookings with valid assignments.
   */
  async generateBookingEarnings(
    bookingIdentifier: string,
    organizationId: string,
    operatorUserId?: string,
  ): Promise<{ providerEarning?: EarningResponseDto; deliveryEarning?: EarningResponseDto }> {
    const booking = await this.financialRepo.findBooking(organizationId, bookingIdentifier);
    if (!booking) {
      throw new NotFoundException({
        code: FinancialErrorCode.EARNING_NOT_FOUND,
        message: `Booking '${bookingIdentifier}' was not found.`,
      });
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException({
        code: FinancialErrorCode.EARNING_NOT_ELIGIBLE,
        message: `Cannot generate earnings for booking in status '${booking.status}'. Booking must be COMPLETED.`,
      });
    }

    // Check existing earnings to prevent duplicates
    const existingEarnings = await this.prisma.earning.findMany({
      where: {
        organizationId,
        bookingId: booking.id,
        status: { not: EarningStatus.CANCELLED },
      },
    });

    let createdProviderEarning: Earning | undefined;
    let createdDeliveryEarning: Earning | undefined;

    // 1. Provider Earning Generation
    if (booking.providerId && !existingEarnings.some((e) => e.providerId === booking.providerId)) {
      const grossAmount = booking.subtotal;
      const commissionRate = new Prisma.Decimal(0.15); // 15% platform commission
      const platformFee = grossAmount.mul(commissionRate);
      const netAmount = grossAmount.sub(platformFee);

      createdProviderEarning = await this.financialRepo.createEarningWithTransaction({
        organizationId,
        bookingId: booking.id,
        providerId: booking.providerId,
        grossAmount,
        platformFee,
        netAmount,
        currency: booking.currency,
        actorUserId: operatorUserId,
      });
    }

    // 2. Delivery Partner Earning Generation
    // Check if there is an active/completed delivery assignment
    const deliveryAssignment = booking.assignments?.find(
      (a: any) =>
        a.type === 'DELIVERY_PARTNER' &&
        a.deliveryPartnerId &&
        ['ACCEPTED', 'ARRIVED', 'COMPLETED', 'IN_TRANSIT'].includes(a.status),
    );

    if (
      deliveryAssignment?.deliveryPartnerId &&
      !existingEarnings.some((e) => e.deliveryPartnerId === deliveryAssignment.deliveryPartnerId)
    ) {
      // Deterministic delivery fee: 50.00 INR base fee
      const deliveryFee = new Prisma.Decimal(50.0);
      createdDeliveryEarning = await this.financialRepo.createEarningWithTransaction({
        organizationId,
        bookingId: booking.id,
        deliveryPartnerId: deliveryAssignment.deliveryPartnerId,
        grossAmount: deliveryFee,
        platformFee: new Prisma.Decimal(0),
        netAmount: deliveryFee,
        currency: booking.currency,
        actorUserId: operatorUserId,
      });
    }

    return {
      providerEarning: createdProviderEarning ? this.mapEarningToDto(createdProviderEarning) : undefined,
      deliveryEarning: createdDeliveryEarning ? this.mapEarningToDto(createdDeliveryEarning) : undefined,
    };
  }

  /**
   * Operations: Adjust existing earning with compensating transaction
   */
  async adjustEarning(
    earningIdentifier: string,
    dto: AdjustEarningDto,
    organizationId: string,
    operatorUserId: string,
  ): Promise<EarningResponseDto> {
    const earning = await this.financialRepo.findEarningByIdentifier(
      organizationId,
      earningIdentifier,
    );
    if (!earning) {
      throw new NotFoundException({
        code: FinancialErrorCode.EARNING_NOT_FOUND,
        message: `Earning '${earningIdentifier}' was not found.`,
      });
    }

    if (earning.status === EarningStatus.PAID_OUT || earning.status === EarningStatus.CANCELLED) {
      throw new ConflictException({
        code: FinancialErrorCode.EARNING_INVALID_STATE,
        message: `Cannot adjust earning in status '${earning.status}'.`,
      });
    }

    const adjustmentAmount = new Prisma.Decimal(dto.adjustmentAmount);
    const updated = await this.financialRepo.adjustEarningWithTransaction({
      earning,
      adjustmentAmount,
      type: dto.type,
      notes: dto.notes,
      actorUserId: operatorUserId,
    });

    return this.mapEarningToDto(updated);
  }

  /**
   * Provider views own earnings (Self-Scope Only)
   */
  async getProviderEarnings(
    query: EarningListQueryDto,
    organizationId: string,
    providerUserId: string,
  ): Promise<{ data: EarningResponseDto[]; total: number }> {
    const provider = await this.financialRepo.findProviderByUserId(providerUserId);
    if (!provider) {
      return { data: [], total: 0 };
    }

    const where: Prisma.EarningWhereInput = {
      organizationId,
      providerId: provider.id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.bookingId
        ? {
            booking: {
              OR: [{ id: query.bookingId }, { bookingNumber: query.bookingId }],
            },
          }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [earnings, total] = await Promise.all([
      this.prisma.earning.findMany({
        where,
        include: { transactions: { orderBy: { createdAt: 'desc' } } },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.earning.count({ where }),
    ]);

    return {
      data: earnings.map((e) => this.mapEarningToDto(e)),
      total,
    };
  }

  /**
   * Provider views single earning detail (Self-Scope Only)
   */
  async getProviderEarningById(
    earningIdentifier: string,
    organizationId: string,
    providerUserId: string,
  ): Promise<EarningResponseDto> {
    const provider = await this.financialRepo.findProviderByUserId(providerUserId);
    if (!provider) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'Provider profile required.',
      });
    }

    const earning = await this.financialRepo.findEarningByIdentifier(
      organizationId,
      earningIdentifier,
    );
    if (!earning) {
      throw new NotFoundException({
        code: FinancialErrorCode.EARNING_NOT_FOUND,
        message: `Earning '${earningIdentifier}' was not found.`,
      });
    }

    if (earning.providerId !== provider.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'You are not authorized to view another provider earnings.',
      });
    }

    return this.mapEarningToDto(earning);
  }

  /**
   * Provider views transactions for an earning (Self-Scope Only)
   */
  async getProviderEarningTransactions(
    earningIdentifier: string,
    organizationId: string,
    providerUserId: string,
  ): Promise<EarningTransactionResponseDto[]> {
    const provider = await this.financialRepo.findProviderByUserId(providerUserId);
    if (!provider) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'Provider profile required.',
      });
    }

    const earning = await this.financialRepo.findEarningByIdentifier(
      organizationId,
      earningIdentifier,
    );
    if (!earning) {
      throw new NotFoundException({
        code: FinancialErrorCode.EARNING_NOT_FOUND,
        message: `Earning '${earningIdentifier}' was not found.`,
      });
    }

    if (earning.providerId !== provider.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'You are not authorized to view transactions for this earning.',
      });
    }

    const transactions = await this.prisma.earningTransaction.findMany({
      where: {
        organizationId,
        earningId: earning.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.mapEarningTransactionToDto(t));
  }

  /**
   * Delivery partner views own earnings (Self-Scope Only)
   */
  async getDeliveryPartnerEarnings(
    query: EarningListQueryDto,
    organizationId: string,
    deliveryPartnerUserId: string,
  ): Promise<{ data: EarningResponseDto[]; total: number }> {
    const deliveryPartner = await this.financialRepo.findDeliveryPartnerByUserId(
      deliveryPartnerUserId,
    );
    if (!deliveryPartner) {
      return { data: [], total: 0 };
    }

    const where: Prisma.EarningWhereInput = {
      organizationId,
      deliveryPartnerId: deliveryPartner.id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.bookingId
        ? {
            booking: {
              OR: [{ id: query.bookingId }, { bookingNumber: query.bookingId }],
            },
          }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [earnings, total] = await Promise.all([
      this.prisma.earning.findMany({
        where,
        include: { transactions: { orderBy: { createdAt: 'desc' } } },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.earning.count({ where }),
    ]);

    return {
      data: earnings.map((e) => this.mapEarningToDto(e)),
      total,
    };
  }

  /**
   * Delivery partner views single earning detail (Self-Scope Only)
   */
  async getDeliveryPartnerEarningById(
    earningIdentifier: string,
    organizationId: string,
    deliveryPartnerUserId: string,
  ): Promise<EarningResponseDto> {
    const deliveryPartner = await this.financialRepo.findDeliveryPartnerByUserId(
      deliveryPartnerUserId,
    );
    if (!deliveryPartner) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'Delivery partner profile required.',
      });
    }

    const earning = await this.financialRepo.findEarningByIdentifier(
      organizationId,
      earningIdentifier,
    );
    if (!earning) {
      throw new NotFoundException({
        code: FinancialErrorCode.EARNING_NOT_FOUND,
        message: `Earning '${earningIdentifier}' was not found.`,
      });
    }

    if (earning.deliveryPartnerId !== deliveryPartner.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'You are not authorized to view another partner earnings.',
      });
    }

    return this.mapEarningToDto(earning);
  }

  /**
   * Delivery partner views transactions for an earning (Self-Scope Only)
   */
  async getDeliveryPartnerEarningTransactions(
    earningIdentifier: string,
    organizationId: string,
    deliveryPartnerUserId: string,
  ): Promise<EarningTransactionResponseDto[]> {
    const deliveryPartner = await this.financialRepo.findDeliveryPartnerByUserId(
      deliveryPartnerUserId,
    );
    if (!deliveryPartner) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'Delivery partner profile required.',
      });
    }

    const earning = await this.financialRepo.findEarningByIdentifier(
      organizationId,
      earningIdentifier,
    );
    if (!earning) {
      throw new NotFoundException({
        code: FinancialErrorCode.EARNING_NOT_FOUND,
        message: `Earning '${earningIdentifier}' was not found.`,
      });
    }

    if (earning.deliveryPartnerId !== deliveryPartner.id) {
      throw new ForbiddenException({
        code: FinancialErrorCode.EARNING_ACCESS_DENIED,
        message: 'You are not authorized to view transactions for this earning.',
      });
    }

    const transactions = await this.prisma.earningTransaction.findMany({
      where: {
        organizationId,
        earningId: earning.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.mapEarningTransactionToDto(t));
  }

  /**
   * Operations: Get paginated earnings with filters
   */
  async getOperationsEarnings(
    query: EarningListQueryDto,
    organizationId: string,
  ): Promise<{ data: EarningResponseDto[]; total: number }> {
    const where: Prisma.EarningWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.providerId ? { providerId: query.providerId } : {}),
      ...(query.deliveryPartnerId ? { deliveryPartnerId: query.deliveryPartnerId } : {}),
      ...(query.bookingId
        ? {
            booking: {
              OR: [{ id: query.bookingId }, { bookingNumber: query.bookingId }],
            },
          }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [earnings, total] = await Promise.all([
      this.prisma.earning.findMany({
        where,
        include: { transactions: { orderBy: { createdAt: 'desc' } } },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.earning.count({ where }),
    ]);

    return {
      data: earnings.map((e) => this.mapEarningToDto(e)),
      total,
    };
  }

  /**
   * Operations: Get single earning detail
   */
  async getOperationsEarningById(
    earningIdentifier: string,
    organizationId: string,
  ): Promise<EarningResponseDto> {
    const earning = await this.financialRepo.findEarningByIdentifier(
      organizationId,
      earningIdentifier,
    );
    if (!earning) {
      throw new NotFoundException({
        code: FinancialErrorCode.EARNING_NOT_FOUND,
        message: `Earning '${earningIdentifier}' was not found.`,
      });
    }

    return this.mapEarningToDto(earning);
  }

  /**
   * Operations: Get earning transactions list
   */
  async getOperationsEarningTransactions(
    query: { earningId?: string; from?: string; to?: string; page?: number; limit?: number },
    organizationId: string,
  ): Promise<{ data: EarningTransactionResponseDto[]; total: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EarningTransactionWhereInput = {
      organizationId,
      ...(query.earningId ? { earningId: query.earningId } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.earningTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.earningTransaction.count({ where }),
    ]);

    return {
      data: items.map((et) => this.mapEarningTransactionToDto(et)),
      total,
    };
  }

  /**
   * Operations: Get single earning transaction detail
   */
  async getOperationsEarningTransactionById(
    id: string,
    organizationId: string,
  ): Promise<EarningTransactionResponseDto> {
    const item = await this.prisma.earningTransaction.findFirst({
      where: { id, organizationId },
    });
    if (!item) {
      throw new NotFoundException({
        code: FinancialErrorCode.EARNING_NOT_FOUND,
        message: `Earning transaction '${id}' was not found.`,
      });
    }

    return this.mapEarningTransactionToDto(item);
  }
}
