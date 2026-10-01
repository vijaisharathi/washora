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
import { TransactionListQueryDto, TransactionResponseDto } from '../dto';
import { TransactionService } from '../services/transaction.service';

@ApiTags('Customer Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer')
export class CustomerTransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated list of transactions for customer' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async getTransactions(
    @Query() query: TransactionListQueryDto,
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.transactionService.getCustomerTransactions(
      query,
      req.organization.organizationId,
      req.user.id,
    );
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  @Get('transactions/:transactionId')
  @ApiOperation({ summary: 'Get transaction detail for customer' })
  @ApiResponse({ status: 200, description: 'Transaction detail', type: TransactionResponseDto })
  async getTransactionById(
    @Param('transactionId') transactionId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const transaction = await this.transactionService.getCustomerTransactionById(
      transactionId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(transaction);
  }

  @Get('bookings/:bookingId/transactions')
  @ApiOperation({ summary: 'Get transactions associated with customer booking' })
  @ApiResponse({ status: 200, description: 'List of booking transactions' })
  async getBookingTransactions(
    @Param('bookingId') bookingId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const transactions = await this.transactionService.getCustomerBookingTransactions(
      bookingId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(transactions);
  }
}
