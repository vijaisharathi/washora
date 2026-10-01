import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import {
  CreateExperimentDto,
  UpdateExperimentStatusDto,
  AssignExperimentVariantDto,
} from '../dto/experiment.dto';
import { ExperimentService } from '../services/experiment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import type { OrganizationContext } from '../../authorization/types/authorization.types';

@ApiTags('Analytics — Experiments & Feature Flags')
@Controller('analytics/experiments')
export class ExperimentController {
  constructor(private readonly experimentService: ExperimentService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Create new A/B experiment or feature rollout (Admin only)' })
  async createExperiment(
    @CurrentOrganization() org: OrganizationContext,
    @Body() dto: CreateExperimentDto,
  ) {
    const data = await this.experimentService.createExperiment(org.organizationId, dto);
    return createSuccessResponse(data);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List all organization experiments (Admin / Ops only)' })
  async listExperiments(@CurrentOrganization() org: OrganizationContext) {
    const data = await this.experimentService.listExperiments(org.organizationId);
    return createSuccessResponse(data);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update experiment lifecycle status or declare winning variant (Admin only)' })
  async updateStatus(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') id: string,
    @Body() dto: UpdateExperimentStatusDto,
  ) {
    const data = await this.experimentService.updateStatus(org.organizationId, id, dto);
    return createSuccessResponse(data);
  }

  @Get(':id/results')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get statistical results and metric lift for an experiment' })
  async getResults(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') id: string,
  ) {
    const data = await this.experimentService.getExperimentResults(org.organizationId, id);
    return createSuccessResponse(data);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Get deterministic variant assignment for user or visitor session' })
  async assignVariant(
    @Body() dto: AssignExperimentVariantDto,
    @Headers('x-organization-id') headerOrgId?: string,
    @Req() req?: any,
  ) {
    const orgId = req?.user?.organizationId || headerOrgId || 'DEFAULT_ORG';
    const actorUserId = req?.user?.id;
    const data = await this.experimentService.assignVariant(orgId, dto, actorUserId);
    return createSuccessResponse(data);
  }
}
