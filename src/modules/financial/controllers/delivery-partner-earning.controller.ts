import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
  EarningListQueryDto,
  EarningResponseDto,
  EarningSummaryDto,
  EarningTransactionResponseDto,
} from '../dto';
import { EarningsService } from '../services/earnings.service';
import { FinancialSummaryService } from '../services/financial-summary.service';

@ApiTags('Delivery Partner Earnings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.DELIVERY_PARTNER, RoleType.ADMIN)
@Controller('delivery-partner')
export class DeliveryPartnerEarningController {
  constructor(
    private readonly earningsService: EarningsService,
    private readonly summaryService: FinancialSummaryService,
  ) {}

  @Get('earnings')
  @ApiOperation({ summary: 'Get paginated list of earnings for authenticated delivery partner' })
  @ApiResponse({ status: 200, description: 'List of delivery partner earnings' })
  async getEarnings(
    @Query() query: EarningListQueryDto,
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.earningsService.getDeliveryPartnerEarnings(
      query,
      req.organization.organizationId,
      req.user.id,
    );
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  @Get('earnings/summary')
  @ApiOperation({ summary: 'Get financial earnings summary for delivery partner' })
  @ApiResponse({ status: 200, description: 'Delivery partner earnings summary', type: EarningSummaryDto })
  async getSummary(@Req() req: AuthorizedRequest) {
    const summary = await this.summaryService.getDeliveryPartnerEarningSummary(
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(summary);
  }

  @Get('earnings/:earningId')
  @ApiOperation({ summary: 'Get delivery partner earning detail by ID' })
  @ApiResponse({ status: 200, description: 'Earning detail', type: EarningResponseDto })
  async getEarningById(
    @Param('earningId') earningId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const earning = await this.earningsService.getDeliveryPartnerEarningById(
      earningId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(earning);
  }

  @Get('earnings/:earningId/transactions')
  @ApiOperation({ summary: 'Get breakdown ledger transactions for delivery partner earning' })
  @ApiResponse({ status: 200, description: 'List of earning transactions', type: [EarningTransactionResponseDto] })
  async getEarningTransactions(
    @Param('earningId') earningId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const transactions = await this.earningsService.getDeliveryPartnerEarningTransactions(
      earningId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(transactions);
  }
}
