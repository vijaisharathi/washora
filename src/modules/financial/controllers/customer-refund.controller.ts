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
import { RefundListQueryDto, RefundResponseDto } from '../dto';
import { RefundService } from '../services/refund.service';

@ApiTags('Customer Refunds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer')
export class CustomerRefundController {
  constructor(private readonly refundService: RefundService) {}

  @Get('refunds')
  @ApiOperation({ summary: 'Get paginated list of refunds for authenticated customer' })
  @ApiResponse({ status: 200, description: 'List of customer refunds' })
  async getRefunds(
    @Query() query: RefundListQueryDto,
    @Req() req: AuthorizedRequest,
  ) {
    const { data, total } = await this.refundService.getCustomerRefunds(
      query,
      req.organization.organizationId,
      req.user.id,
    );
    return createPaginatedResponse(data, query.page, query.limit, total);
  }

  @Get('refunds/:refundId')
  @ApiOperation({ summary: 'Get refund detail by ID for customer' })
  @ApiResponse({ status: 200, description: 'Refund detail', type: RefundResponseDto })
  async getRefundById(
    @Param('refundId') refundId: string,
    @Req() req: AuthorizedRequest,
  ) {
    const refund = await this.refundService.getCustomerRefundById(
      refundId,
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(refund);
  }
}
