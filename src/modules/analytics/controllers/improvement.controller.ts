import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { CreateImprovementDto, UpdateImprovementDto } from '../dto/improvement.dto';
import { ImprovementService } from '../services/improvement.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import type { AuthenticatedUser } from '../../auth/types/auth.types';

@ApiTags('Analytics — Product Continuous Improvements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('analytics/improvements')
export class ImprovementController {
  constructor(private readonly improvementService: ImprovementService) {}

  @Post()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Submit new continuous product improvement initiative' })
  async createImprovement(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateImprovementDto,
  ) {
    const data = await this.improvementService.createImprovement(org.organizationId, user.id, dto);
    return createSuccessResponse(data);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List continuous improvement backlog initiatives' })
  async listImprovements(
    @CurrentOrganization() org: OrganizationContext,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    const data = await this.improvementService.listImprovements(org.organizationId, {
      status,
      category,
    });
    return createSuccessResponse(data);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update continuous improvement lifecycle status or measured lift' })
  async updateImprovement(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') id: string,
    @Body() dto: UpdateImprovementDto,
  ) {
    const data = await this.improvementService.updateImprovement(org.organizationId, id, dto);
    return createSuccessResponse(data);
  }
}
