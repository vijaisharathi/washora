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
  RewardAccountResponseDto,
  RewardRedeemDto,
  RewardRedeemResponseDto,
  RewardTransactionQueryDto,
  RewardTransactionResponseDto,
} from '../dto';
import { RewardService } from '../services/reward.service';

@ApiTags('Customer Rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer/rewards')
export class CustomerRewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer reward account balance and summary' })
  @ApiResponse({
    status: 200,
    description: 'Reward account summary',
    type: RewardAccountResponseDto,
  })
  async getRewardAccount(@Req() req: AuthorizedRequest) {
    const data = await this.rewardService.getCustomerRewardAccount(
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List customer reward transaction ledger entries' })
  @ApiResponse({
    status: 200,
    description: 'Paginated reward transactions',
    type: [RewardTransactionResponseDto],
  })
  async getRewardTransactions(
    @Req() req: AuthorizedRequest,
    @Query() query: RewardTransactionQueryDto,
  ) {
    const result = await this.rewardService.getCustomerRewardTransactions(
      req.organization.organizationId,
      req.user.id,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.limit,
      result.total,
    );
  }

  @Get('transactions/:transactionId')
  @ApiOperation({ summary: 'Get detail of a specific customer reward transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    type: RewardTransactionResponseDto,
  })
  async getRewardTransaction(
    @Req() req: AuthorizedRequest,
    @Param('transactionId') transactionId: string,
  ) {
    const data = await this.rewardService.getCustomerRewardTransaction(
      req.organization.organizationId,
      req.user.id,
      transactionId,
    );
    return createSuccessResponse(data);
  }

  @Post('redeem')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Redeem reward points for booking discount (100 pts = ₹10 => 10 pts = ₹1)',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique key for safe idempotent points redemption',
  })
  @ApiResponse({
    status: 201,
    description: 'Reward points redeemed successfully',
    type: RewardRedeemResponseDto,
  })
  async redeemRewards(
    @Req() req: AuthorizedRequest,
    @Body() dto: RewardRedeemDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const data = await this.rewardService.redeemCustomerRewards(
      req.organization.organizationId,
      req.user.id,
      dto,
      idempotencyKey,
    );
    return createSuccessResponse(data);
  }
}
