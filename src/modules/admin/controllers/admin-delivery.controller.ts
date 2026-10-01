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
  DeliveryPartnerAdminQueryDto,
  UpdateDeliveryPartnerAdminDto,
} from '../dto/entity-admin.dto';
import { AdminDeliveryService } from '../services/admin-delivery.service';

@ApiTags('Admin — Delivery Partner Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/delivery-partners')
export class AdminDeliveryController {
  constructor(private readonly deliveryService: AdminDeliveryService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List delivery partners with vehicle, verification and status' })
  async listDeliveryPartners(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: DeliveryPartnerAdminQueryDto,
  ) {
    const result = await this.deliveryService.listDeliveryPartners(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get delivery partner profile, documents and coverage' })
  async getDeliveryPartner(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') partnerId: string,
  ) {
    const data = await this.deliveryService.getDeliveryPartner(org.organizationId, partnerId);
    return createSuccessResponse(data);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update delivery partner status, vehicle or verification' })
  async updateDeliveryPartner(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') partnerId: string,
    @Body() dto: UpdateDeliveryPartnerAdminDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.deliveryService.updateDeliveryPartner(
      org.organizationId,
      partnerId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Get(':id/assignments')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get delivery partner assignment history' })
  async getDeliveryPartnerAssignments(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') partnerId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    const result = await this.deliveryService.getDeliveryPartnerAssignments(
      org.organizationId,
      partnerId,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id/earnings')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get delivery partner earnings' })
  async getDeliveryPartnerEarnings(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') partnerId: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    const result = await this.deliveryService.getDeliveryPartnerEarnings(
      org.organizationId,
      partnerId,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }
}
