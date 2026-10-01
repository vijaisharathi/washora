import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { IngestAnalyticsEventDto, BatchIngestAnalyticsEventsDto } from '../dto/analytics-event.dto';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import type { AuthenticatedUser } from '../../auth/types/auth.types';

@ApiTags('Analytics — Event Telemetry')
@Controller('analytics/events')
export class AnalyticsEventController {
  constructor(private readonly eventService: AnalyticsEventService) {}

  @Post()
  @ApiOperation({ summary: 'Ingest single analytics telemetry event' })
  async ingestEvent(
    @Body() dto: IngestAnalyticsEventDto,
    @Headers('x-organization-id') headerOrgId?: string,
    @Ip() ip?: string,
    @Req() req?: any,
  ) {
    const orgId = req?.user?.organizationId || headerOrgId || 'DEFAULT_ORG';
    const actorUserId = req?.user?.id;
    const result = await this.eventService.ingestEvent(orgId, dto, actorUserId, ip);
    return createSuccessResponse(result);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Ingest batch of analytics telemetry events' })
  async ingestBatch(
    @Body() dto: BatchIngestAnalyticsEventsDto,
    @Headers('x-organization-id') headerOrgId?: string,
    @Ip() ip?: string,
    @Req() req?: any,
  ) {
    const orgId = req?.user?.organizationId || headerOrgId || 'DEFAULT_ORG';
    const actorUserId = req?.user?.id;
    const result = await this.eventService.ingestBatch(orgId, dto, actorUserId, ip);
    return createSuccessResponse(result);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Query telemetry event stream (Admin / Ops only)' })
  async queryEvents(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    const data = await this.eventService.queryEvents(org.organizationId, query);
    return createSuccessResponse(data);
  }
}
