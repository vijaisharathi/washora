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
  ProviderAdminQueryDto,
  UpdateProviderAdminDto,
} from '../dto/entity-admin.dto';
import { AdminProviderService } from '../services/admin-provider.service';

@ApiTags('Admin — Provider Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/providers')
export class AdminProviderController {
  constructor(private readonly providerService: AdminProviderService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List service providers with status, verification and search' })
  async listProviders(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: ProviderAdminQueryDto,
  ) {
    const result = await this.providerService.listProviders(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get provider profile, documents and coverage areas' })
  async getProvider(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') providerId: string,
  ) {
    const data = await this.providerService.getProvider(org.organizationId, providerId);
    return createSuccessResponse(data);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update provider status, verification or commission rate' })
  async updateProvider(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') providerId: string,
    @Body() dto: UpdateProviderAdminDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.providerService.updateProvider(
      org.organizationId,
      providerId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Get(':id/services')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get provider catalog services' })
  async getProviderServices(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') providerId: string,
  ) {
    const data = await this.providerService.getProviderServices(org.organizationId, providerId);
    return createSuccessResponse(data);
  }

  @Get(':id/bookings')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get provider booking history' })
  async getProviderBookings(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') providerId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    const result = await this.providerService.getProviderBookings(org.organizationId, providerId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id/earnings')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get provider earnings and settlements' })
  async getProviderEarnings(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') providerId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    const result = await this.providerService.getProviderEarnings(org.organizationId, providerId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }
}
