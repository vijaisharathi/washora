import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { GlobalSearchQueryDto } from '../dto/operations-admin.dto';
import { AdminSearchService } from '../services/admin-search.service';

@ApiTags('Admin — Unified Global Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/search')
export class AdminSearchController {
  constructor(private readonly searchService: AdminSearchService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Global search across 9 entities with ranking and entity filters' })
  async search(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: GlobalSearchQueryDto,
  ) {
    const data = await this.searchService.search(org.organizationId, query);
    return createSuccessResponse(data);
  }
}
