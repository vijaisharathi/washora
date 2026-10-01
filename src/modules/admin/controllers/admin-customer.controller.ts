import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
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
  CustomerAdminQueryDto,
  UpdateCustomerAdminDto,
} from '../dto/entity-admin.dto';
import { AdminCustomerService } from '../services/admin-customer.service';

@ApiTags('Admin — Customer Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/customers')
export class AdminCustomerController {
  constructor(private readonly customerService: AdminCustomerService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List customers with tier, status and search' })
  async listCustomers(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: CustomerAdminQueryDto,
  ) {
    const result = await this.customerService.listCustomers(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get customer profile and summary' })
  async getCustomer(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') customerId: string,
  ) {
    const data = await this.customerService.getCustomer(org.organizationId, customerId);
    return createSuccessResponse(data);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update customer details, tier or status' })
  async updateCustomer(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') customerId: string,
    @Body() dto: UpdateCustomerAdminDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.customerService.updateCustomer(
      org.organizationId,
      customerId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Get(':id/bookings')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get customer booking history' })
  async getCustomerBookings(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') customerId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    const result = await this.customerService.getCustomerBookings(org.organizationId, customerId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id/payments')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get customer payment history' })
  async getCustomerPayments(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') customerId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    const result = await this.customerService.getCustomerPayments(org.organizationId, customerId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id/addresses')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get customer saved addresses' })
  async getCustomerAddresses(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') customerId: string,
  ) {
    const data = await this.customerService.getCustomerAddresses(org.organizationId, customerId);
    return createSuccessResponse(data);
  }
}
