import {
  Body,
  Controller,
  Get,
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
  RewardAccountQueryDto,
  RewardAccountResponseDto,
  RewardAdjustmentDto,
  RewardReverseDto,
  RewardTransactionQueryDto,
  RewardTransactionResponseDto,
} from '../dto';
import { RewardService } from '../services/reward.service';

@ApiTags('Operations Rewards Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.OPERATIONS, RoleType.ADMIN)
@Controller('operations/rewards')
export class OperationsRewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'List customer reward accounts across the organization' })
  @ApiResponse({
    status: 200,
    description: 'Paginated customer reward accounts',
    type: [RewardAccountResponseDto],
  })
  async getRewardAccounts(
    @Req() req: AuthorizedRequest,
    @Query() query: RewardAccountQueryDto,
  ) {
    const result = await this.rewardService.getOperationsRewardAccounts(
      req.organization.organizationId,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.limit,
      result.total,
    );
  }

  @Get('accounts/:accountId')
  @ApiOperation({ summary: 'Get details of a specific customer reward account' })
  @ApiResponse({
    status: 200,
    description: 'Reward account detail',
    type: RewardAccountResponseDto,
  })
  async getRewardAccount(
    @Req() req: AuthorizedRequest,
    @Param('accountId') accountId: string,
  ) {
    const data = await this.rewardService.getOperationsRewardAccount(
      req.organization.organizationId,
      accountId,
    );
    return createSuccessResponse(data);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List all tenant reward ledger transactions' })
  @ApiResponse({
    status: 200,
    description: 'Paginated reward transactions journal',
    type: [RewardTransactionResponseDto],
  })
  async getRewardTransactions(
    @Req() req: AuthorizedRequest,
    @Query() query: RewardTransactionQueryDto,
  ) {
    const result = await this.rewardService.getOperationsRewardTransactions(
      req.organization.organizationId,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.limit,
      result.total,
    );
  }

  @Post('accounts/:accountId/adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adjust customer reward balance with an immutable ledger entry and mandatory reason',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance adjusted successfully',
  })
  async adjustRewardAccount(
    @Req() req: AuthorizedRequest,
    @Param('accountId') accountId: string,
    @Body() dto: RewardAdjustmentDto,
  ) {
    const data = await this.rewardService.adjustRewardAccount(
      req.organization.organizationId,
      accountId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Post('transactions/:transactionId/reverse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reverse a completed reward transaction with a compensating ledger record',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction reversed successfully',
  })
  async reverseRewardTransaction(
    @Req() req: AuthorizedRequest,
    @Param('transactionId') transactionId: string,
    @Body() dto: RewardReverseDto,
  ) {
    const data = await this.rewardService.reverseRewardTransaction(
      req.organization.organizationId,
      transactionId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(data);
  }
}
