import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import {
  createPaginatedResponse,
  createSuccessResponse,
} from '../../../common/utils/response.util';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { AuthorizedRequest } from '../../authorization/types/authorization.types';
import {
  AdjustEarningDto,
  CreateRefundDto,
  EarningListQueryDto,
  EarningResponseDto,
  EarningTransactionResponseDto,
  OperationsFinancialSummaryDto,
  PaymentListQueryDto,
  PaymentResponseDto,
  ProcessPaymentDto,
  ProcessRefundDto,
  RefundListQueryDto,
  RefundResponseDto,
  TransactionListQueryDto,
  TransactionResponseDto,
} from '../dto';
import { EarningsService } from '../services/earnings.service';
import { FinancialSummaryService } from '../services/financial-summary.service';
import { PaymentService } from '../services/payment.service';
import { RefundService } from '../services/refund.service';
import { TransactionService } from '../services/transaction.service';

@ApiTags('Operations Financial Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.OPERATIONS, RoleType.ADMIN, RoleType.FINANCE_ADMIN)
@Controller('operations')
export class OperationsFinancialController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
    private readonly refundService: RefundService,
    private readonly earningsService: EarningsService,
    private readonly summaryService: FinancialSummaryService,
  ) {}

  // ==========================================
  // PAYMENTS
  // ==========================================

  @Get('payments')
  @ApiOperation({ summary: 'Operations: Get paginated organization payments with filters' })
  @ApiResponse({ status: 200, description: 'List of organization payments' })
  async getPayments(
    @Query() query: PaymentListQueryDto,
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.paymentService.getOperationsPayments(
      query,
      req.organization.organizationId,
    );
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  @Get('payments/:paymentId')
  @ApiOperation({ summary: 'Operations: Get payment detail by ID' })
  @ApiResponse({ status: 200, description: 'Payment detail', type: PaymentResponseDto })
  async getPaymentById(
    @Param('paymentId') paymentId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const payment = await this.paymentService.getOperationsPaymentById(
      paymentId,
      req.organization.organizationId,
    );
    return createSuccessResponse(payment);
  }

  @Post('payments/:paymentId/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Operations: Mark payment as processing' })
  @ApiResponse({ status: 200, description: 'Payment moved to processing' })
  async processPayment(
    @Param('paymentId') paymentId: string,
    @Body() dto: ProcessPaymentDto,
    @Req() req: AuthorizedRequest,
  ) {
    const payment = await this.paymentService.processOperationsPayment(
      paymentId,
      dto,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(payment);
  }

  @Post('payments/:paymentId/mark-paid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Operations: Mark payment as confirmed paid' })
  @ApiResponse({ status: 200, description: 'Payment captured and confirmed paid' })
  async markPaymentPaid(
    @Param('paymentId') paymentId: string,
    @Body() dto: ProcessPaymentDto,
    @Req() req: AuthorizedRequest,
  ) {
    const payment = await this.paymentService.markOperationsPaymentPaid(
      paymentId,
      dto,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(payment);
  }

  @Post('payments/:paymentId/mark-failed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Operations: Mark payment as failed' })
  @ApiResponse({ status: 200, description: 'Payment failed' })
  async markPaymentFailed(
    @Param('paymentId') paymentId: string,
    @Body() dto: ProcessPaymentDto,
    @Req() req: AuthorizedRequest,
  ) {
    const payment = await this.paymentService.markOperationsPaymentFailed(
      paymentId,
      dto,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(payment);
  }

  @Post('payments/:paymentId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Operations: Cancel payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled' })
  async cancelPayment(
    @Param('paymentId') paymentId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const payment = await this.paymentService.cancelOperationsPayment(
      paymentId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(payment);
  }

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  @Get('transactions')
  @ApiOperation({ summary: 'Operations: Get paginated organization ledger transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async getTransactions(
    @Query() query: TransactionListQueryDto,
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.transactionService.getOperationsTransactions(
      query,
      req.organization.organizationId,
    );
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  @Get('transactions/:transactionId')
  @ApiOperation({ summary: 'Operations: Get ledger transaction detail' })
  @ApiResponse({ status: 200, description: 'Transaction detail', type: TransactionResponseDto })
  async getTransactionById(
    @Param('transactionId') transactionId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const transaction = await this.transactionService.getOperationsTransactionById(
      transactionId,
      req.organization.organizationId,
    );
    return createSuccessResponse(transaction);
  }

  @Get('bookings/:bookingId/transactions')
  @ApiOperation({ summary: 'Operations: Get transactions for a specific booking' })
  @ApiResponse({ status: 200, description: 'List of booking transactions' })
  async getBookingTransactions(
    @Param('bookingId') bookingId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const transactions = await this.transactionService.getOperationsBookingTransactions(
      bookingId,
      req.organization.organizationId,
    );
    return createSuccessResponse(transactions);
  }

  @Get('payments/:paymentId/transactions')
  @ApiOperation({ summary: 'Operations: Get transactions for a specific payment' })
  @ApiResponse({ status: 200, description: 'List of payment transactions' })
  async getPaymentTransactions(
    @Param('paymentId') paymentId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const transactions = await this.transactionService.getOperationsPaymentTransactions(
      paymentId,
      req.organization.organizationId,
    );
    return createSuccessResponse(transactions);
  }

  // ==========================================
  // REFUNDS
  // ==========================================

  @Post('payments/:paymentId/refunds')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Operations: Issue refund on a payment with balance enforcement' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique key to ensure idempotent refund issuance',
  })
  @ApiResponse({ status: 201, description: 'Refund issued successfully', type: RefundResponseDto })
  async createRefund(
    @Param('paymentId') paymentId: string,
    @Body() dto: CreateRefundDto,
    @Req() req: AuthorizedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const refund = await this.refundService.createRefund(
      paymentId,
      dto,
      req.organization.organizationId,
      req.user.id,
      idempotencyKey,
    );
    return createSuccessResponse(refund);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Operations: Get paginated organization refunds' })
  @ApiResponse({ status: 200, description: 'List of refunds' })
  async getRefunds(
    @Query() query: RefundListQueryDto,
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.refundService.getOperationsRefunds(
      query,
      req.organization.organizationId,
    );
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  @Get('refunds/:refundId')
  @ApiOperation({ summary: 'Operations: Get refund detail by ID' })
  @ApiResponse({ status: 200, description: 'Refund detail', type: RefundResponseDto })
  async getRefundById(
    @Param('refundId') refundId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const refund = await this.refundService.getOperationsRefundById(
      refundId,
      req.organization.organizationId,
    );
    return createSuccessResponse(refund);
  }

  @Post('refunds/:refundId/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Operations: Transition refund status' })
  @ApiResponse({ status: 200, description: 'Refund status updated' })
  async processRefund(
    @Param('refundId') refundId: string,
    @Body() dto: ProcessRefundDto,
    @Req() req: AuthorizedRequest,
  ) {
    const refund = await this.refundService.processRefund(
      refundId,
      dto,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(refund);
  }

  @Post('refunds/:refundId/fail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Operations: Mark refund as failed' })
  @ApiResponse({ status: 200, description: 'Refund marked failed' })
  async failRefund(
    @Param('refundId') refundId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const refund = await this.refundService.failRefund(
      refundId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(refund);
  }

  // ==========================================
  // EARNINGS & SETTLEMENTS
  // ==========================================

  @Get('earnings')
  @ApiOperation({ summary: 'Operations: Get paginated earnings with filters' })
  @ApiResponse({ status: 200, description: 'List of earnings' })
  async getEarnings(
    @Query() query: EarningListQueryDto,
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.earningsService.getOperationsEarnings(
      query,
      req.organization.organizationId,
    );
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  @Get('earnings/summary')
  @ApiOperation({ summary: 'Operations: Get platform-wide financial summary' })
  @ApiResponse({ status: 200, description: 'Operations financial summary', type: OperationsFinancialSummaryDto })
  async getFinancialSummary(@Req() req: AuthorizedRequest) {
    const summary = await this.summaryService.getOperationsFinancialSummary(
      req.organization.organizationId,
    );
    return createSuccessResponse(summary);
  }

  @Get('earnings/:earningId')
  @ApiOperation({ summary: 'Operations: Get earning detail by ID' })
  @ApiResponse({ status: 200, description: 'Earning detail', type: EarningResponseDto })
  async getEarningById(
    @Param('earningId') earningId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const earning = await this.earningsService.getOperationsEarningById(
      earningId,
      req.organization.organizationId,
    );
    return createSuccessResponse(earning);
  }

  @Get('earning-transactions')
  @ApiOperation({ summary: 'Operations: Get paginated earning transactions' })
  @ApiResponse({ status: 200, description: 'List of earning transactions' })
  async getEarningTransactions(
    @Query() query: { earningId?: string; from?: string; to?: string; page?: number; limit?: number },
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.earningsService.getOperationsEarningTransactions(
      query,
      req.organization.organizationId,
    );
    return createPaginatedResponse(data, query.page || 1, query.limit || 20, total);
  }

  @Get('earning-transactions/:earningTransactionId')
  @ApiOperation({ summary: 'Operations: Get single earning transaction detail' })
  @ApiResponse({ status: 200, description: 'Earning transaction detail', type: EarningTransactionResponseDto })
  async getEarningTransactionById(
    @Param('earningTransactionId') id: string,
    @Req() req: AuthorizedRequest,
  ) {
    const item = await this.earningsService.getOperationsEarningTransactionById(
      id,
      req.organization.organizationId,
    );
    return createSuccessResponse(item);
  }

  @Post('bookings/:bookingId/earnings/generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Operations: Trigger earning generation for an eligible completed booking' })
  @ApiResponse({ status: 201, description: 'Earnings generated for completed booking' })
  async generateEarnings(
    @Param('bookingId') bookingId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const result = await this.earningsService.generateBookingEarnings(
      bookingId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(result);
  }

  @Post('earnings/:earningId/adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Operations: Create financial adjustment on earning with compensating transaction' })
  @ApiResponse({ status: 200, description: 'Earning adjusted successfully', type: EarningResponseDto })
  async adjustEarning(
    @Param('earningId') earningId: string,
    @Body() dto: AdjustEarningDto,
    @Req() req: AuthorizedRequest,
  ) {
    const updated = await this.earningsService.adjustEarning(
      earningId,
      dto,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(updated);
  }
}
