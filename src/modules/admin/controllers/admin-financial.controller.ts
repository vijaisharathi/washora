import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentStatus, RoleType } from '@prisma/client';
import {
  createPaginatedResponse,
  createSuccessResponse,
} from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/types/auth.types';
import {
  EarningAdminQueryDto,
  FinancialSummaryQueryDto,
  PaymentAdminQueryDto,
  RefundAdminQueryDto,
  TransactionAdminQueryDto,
} from '../dto/financial-admin.dto';
import { AdminFinancialService } from '../services/admin-financial.service';

@ApiTags('Admin — Financial Control & Reconciliation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/financial')
export class AdminFinancialController {
  constructor(private readonly financialService: AdminFinancialService) {}

  // ============================================================================
  // 1. PAYMENTS
  // ============================================================================

  @Get('payments')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List payments across organization' })
  async listPayments(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: PaymentAdminQueryDto,
  ) {
    const result = await this.financialService.listPayments(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get('payments/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get payment details with transactions and refunds' })
  async getPayment(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') paymentId: string,
  ) {
    const data = await this.financialService.getPayment(org.organizationId, paymentId);
    return createSuccessResponse(data);
  }

  @Post('payments/:id/override')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Override payment status with audit trail (Admin only)' })
  async overridePayment(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') paymentId: string,
    @Body('status') status: PaymentStatus,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.financialService.overridePayment(
      org.organizationId,
      paymentId,
      status,
      reason,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  // ============================================================================
  // 2. TRANSACTIONS
  // ============================================================================

  @Get('transactions')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List ledger transactions with filtering' })
  async listTransactions(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: TransactionAdminQueryDto,
  ) {
    const result = await this.financialService.listTransactions(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get('transactions/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get ledger transaction details' })
  async getTransaction(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') transactionId: string,
  ) {
    const data = await this.financialService.getTransaction(org.organizationId, transactionId);
    return createSuccessResponse(data);
  }

  // ============================================================================
  // 3. REFUNDS
  // ============================================================================

  @Get('refunds')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List refund requests with status and dates' })
  async listRefunds(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: RefundAdminQueryDto,
  ) {
    const result = await this.financialService.listRefunds(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get('refunds/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get refund details' })
  async getRefund(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') refundId: string,
  ) {
    const data = await this.financialService.getRefund(org.organizationId, refundId);
    return createSuccessResponse(data);
  }

  @Post('refunds/:id/process')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Process refund to completion (Admin only)' })
  async processRefund(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') refundId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.financialService.processRefund(org.organizationId, refundId, user.id, ip);
    return createSuccessResponse(data);
  }

  @Post('refunds/:id/fail')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Mark refund as failed (Admin only)' })
  async failRefund(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') refundId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.financialService.failRefund(org.organizationId, refundId, reason, user.id, ip);
    return createSuccessResponse(data);
  }

  // ============================================================================
  // 4. EARNINGS
  // ============================================================================

  @Get('earnings')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List provider and delivery partner earnings' })
  async listEarnings(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: EarningAdminQueryDto,
  ) {
    const result = await this.financialService.listEarnings(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get('earnings/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get earning record details' })
  async getEarning(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') earningId: string,
  ) {
    const data = await this.financialService.getEarning(org.organizationId, earningId);
    return createSuccessResponse(data);
  }

  // ============================================================================
  // 5. SUMMARY
  // ============================================================================

  @Get('summary')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get organization financial summary and revenue aggregates' })
  async getFinancialSummary(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: FinancialSummaryQueryDto,
  ) {
    const data = await this.financialService.getFinancialSummary(org.organizationId, query);
    return createSuccessResponse(data);
  }
}
