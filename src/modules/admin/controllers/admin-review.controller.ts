import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { AdminReviewService } from '../services/admin-review.service';

@ApiTags('Admin — Reviews & Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/reviews')
export class AdminReviewController {
  constructor(private readonly reviewService: AdminReviewService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List customer reviews for moderation' })
  async listReviews(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: any,
  ) {
    const data = await this.reviewService.listReviews(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('reports/all')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List flagged review reports' })
  async listReports(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: any,
  ) {
    const data = await this.reviewService.listReports(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get review details with provider response and history' })
  async getReview(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') reviewId: string,
  ) {
    const data = await this.reviewService.getReview(org.organizationId, reviewId);
    return createSuccessResponse(data);
  }

  @Post(':id/publish')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Approve and publish customer review' })
  async publishReview(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reviewId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.reviewService.publishReview(
      org.organizationId,
      reviewId,
      reason,
      user?.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/hide')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Hide customer review from public marketplace' })
  async hideReview(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reviewId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.reviewService.hideReview(
      org.organizationId,
      reviewId,
      reason,
      user?.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/reject')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Reject abusive or fraudulent review' })
  async rejectReview(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reviewId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.reviewService.rejectReview(
      org.organizationId,
      reviewId,
      reason,
      user?.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/restore')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Restore previously rejected or hidden review' })
  async restoreReview(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reviewId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.reviewService.restoreReview(
      org.organizationId,
      reviewId,
      reason,
      user?.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post('reports/:id/resolve')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Resolve or dismiss review report' })
  async resolveReport(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reportId: string,
    @Body() resolution: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.reviewService.resolveReport(
      org.organizationId,
      reportId,
      resolution,
      user?.id,
      ip,
    );
    return createSuccessResponse(data);
  }
}
