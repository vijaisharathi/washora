import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/types/auth.types';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { AdminOrganizationService } from '../services/admin-organization.service';

@ApiTags('Admin — Organization Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/organization')
export class AdminOrganizationController {
  constructor(private readonly orgService: AdminOrganizationService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get current organization details and settings' })
  async getOrganization(@CurrentOrganization() org: OrganizationContext) {
    const data = await this.orgService.getOrganization(org.organizationId);
    return createSuccessResponse(data);
  }

  @Patch()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update organization settings (Admin only)' })
  async updateOrganization(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOrganizationDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.orgService.updateOrganization(org.organizationId, dto, user.id, ip);
    return createSuccessResponse(data);
  }
}
