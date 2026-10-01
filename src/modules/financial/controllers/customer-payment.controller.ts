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
  CreatePaymentDto,
  PaymentListQueryDto,
  PaymentResponseDto,
  ProcessPaymentDto,
} from '../dto';
import { FinancialSummaryService } from '../services/financial-summary.service';
import { PaymentService } from '../services/payment.service';

@ApiTags('Customer Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer')
export class CustomerPaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly summaryService: FinancialSummaryService,
  ) {}

  @Post('bookings/:bookingId/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate payment for a customer booking' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique key to ensure idempotent payment creation',
  })
  @ApiResponse({ status: 201, description: 'Payment successfully initiated', type: PaymentResponseDto })
  async createPayment(
    @Param('bookingId') bookingId: string,
    @Body() dto: CreatePaymentDto,
    @Req() req: AuthorizedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const payment = await this.paymentService.createCustomerPayment(
      bookingId,
      dto,
      req.organization.organizationId,
      req.user.id,
      idempotencyKey,
    );
    return createSuccessResponse(payment);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get paginated list of payments for authenticated customer' })
  @ApiResponse({ status: 200, description: 'List of customer payments' })
  async getPayments(
    @Query() query: PaymentListQueryDto,
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.paymentService.getCustomerPayments(
      query,
      req.organization.organizationId,
      req.user.id,
    );
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  @Get('payments/summary')
  @ApiOperation({ summary: 'Get customer payment and refund financial summary' })
  @ApiResponse({ status: 200, description: 'Customer financial summary' })
  async getSummary(@Req() req: AuthorizedRequest) {
    const summary = await this.summaryService.getCustomerPaymentSummary(
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(summary);
  }

  @Get('payments/:paymentId')
  @ApiOperation({ summary: 'Get payment detail by ID for authenticated customer' })
  @ApiResponse({ status: 200, description: 'Payment detail' })
  async getPaymentById(
    @Param('paymentId') paymentId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const payment = await this.paymentService.getCustomerPaymentById(
      paymentId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(payment);
  }

  @Get('bookings/:bookingId/payments')
  @ApiOperation({ summary: 'Get payment for a specific customer booking' })
  @ApiResponse({ status: 200, description: 'Booking payment detail' })
  async getBookingPayment(
    @Param('bookingId') bookingId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const query = new PaymentListQueryDto();
    query.bookingId = bookingId;
    const { data } = await this.paymentService.getCustomerPayments(
      query,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(data[0] || null);
  }

  @Post('payments/:paymentId/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer triggers payment processing transition' })
  @ApiResponse({ status: 200, description: 'Payment moved to processing' })
  async processPayment(
    @Param('paymentId') paymentId: string,
    @Body() dto: ProcessPaymentDto,
    @Req() req: AuthorizedRequest,
  ) {
    const payment = await this.paymentService.processCustomerPayment(
      paymentId,
      dto,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(payment);
  }

  @Post('payments/:paymentId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer cancels pending payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled' })
  async cancelPayment(
    @Param('paymentId') paymentId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const payment = await this.paymentService.cancelCustomerPayment(
      paymentId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(payment);
  }
}
