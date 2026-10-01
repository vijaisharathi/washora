import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import {
  DismissReviewReportDto,
  ModerateReviewDto,
  ModerationHistoryResponseDto,
  ResolveReviewReportDto,
  ReviewListQueryDto,
  ReviewReportListQueryDto,
  ReviewReportResponseDto,
  ReviewResponseDto,
} from '../dto';
import { OperationsReviewService } from '../services/operations-review.service';

@ApiTags('Operations Reviews & Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.OPERATIONS, RoleType.ADMIN)
@Controller('operations')
export class OperationsReviewController {
  constructor(
    private readonly operationsReviewService: OperationsReviewService,
  ) {}

  // --------------------------------------------------------------------------
  // Review Moderation Endpoints
  // --------------------------------------------------------------------------

  @Get('reviews')
  @ApiOperation({ summary: 'List and filter organization reviews' })
  @ApiResponse({ status: 200, description: 'Filtered reviews list' })
  async listReviews(
    @Req() req: AuthorizedRequest,
    @Query() query: ReviewListQueryDto,
  ) {
    const data = await this.operationsReviewService.listReviews(
      req.organization.organizationId,
      query,
    );
    return createPaginatedResponse(
      data.items,
      data.meta.page,
      data.meta.pageSize,
      data.meta.total,
    );
  }

  @Get('reviews/:reviewId')
  @ApiOperation({ summary: 'Get single review details including customer, booking, and response' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async getReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    const data = await this.operationsReviewService.getReviewDetails(
      req.organization.organizationId,
      reviewId,
    );
    return createSuccessResponse(data);
  }

  @Post('reviews/:reviewId/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a review (PENDING/HIDDEN -> PUBLISHED)' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async publishReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    const data = await this.operationsReviewService.publishReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
    );
    return createSuccessResponse(data);
  }

  @Post('reviews/:reviewId/hide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hide a review from public display (requires reason)' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async hideReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    const data = await this.operationsReviewService.hideReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
      dto,
    );
    return createSuccessResponse(data);
  }

  @Post('reviews/:reviewId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a review permanently (requires reason)' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async rejectReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    const data = await this.operationsReviewService.rejectReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
      dto,
    );
    return createSuccessResponse(data);
  }

  @Post('reviews/:reviewId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a hidden review back to PUBLISHED' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async restoreReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    const data = await this.operationsReviewService.restoreReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
    );
    return createSuccessResponse(data);
  }

  @Get('reviews/:reviewId/moderation-history')
  @ApiOperation({ summary: 'Get immutable moderation timeline history for a review' })
  @ApiResponse({ status: 200, type: [ModerationHistoryResponseDto] })
  async getModerationHistory(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    const data = await this.operationsReviewService.getModerationHistory(
      req.organization.organizationId,
      reviewId,
    );
    return createSuccessResponse(data);
  }

  // --------------------------------------------------------------------------
  // Review Abuse Reports Endpoints
  // --------------------------------------------------------------------------

  @Get('review-reports')
  @ApiOperation({ summary: 'List review abuse reports' })
  @ApiResponse({ status: 200, description: 'List of review reports' })
  async listReviewReports(
    @Req() req: AuthorizedRequest,
    @Query() query: ReviewReportListQueryDto,
  ) {
    const data = await this.operationsReviewService.listReviewReports(
      req.organization.organizationId,
      query,
    );
    return createPaginatedResponse(
      data.items,
      data.meta.page,
      data.meta.pageSize,
      data.meta.total,
    );
  }

  @Get('review-reports/:reportId')
  @ApiOperation({ summary: 'Get single review abuse report details' })
  @ApiResponse({ status: 200, type: ReviewReportResponseDto })
  async getReviewReport(
    @Req() req: AuthorizedRequest,
    @Param('reportId') reportId: string,
  ) {
    const data = await this.operationsReviewService.getReviewReport(
      req.organization.organizationId,
      reportId,
    );
    return createSuccessResponse(data);
  }

  @Post('review-reports/:reportId/start-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Acknowledge and mark report as UNDER_REVIEW' })
  @ApiResponse({ status: 200, type: ReviewReportResponseDto })
  async startReportReview(
    @Req() req: AuthorizedRequest,
    @Param('reportId') reportId: string,
  ) {
    const data = await this.operationsReviewService.startReportReview(
      req.organization.organizationId,
      req.user.id,
      reportId,
    );
    return createSuccessResponse(data);
  }

  @Post('review-reports/:reportId/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a review abuse report with resolution note' })
  @ApiResponse({ status: 200, type: ReviewReportResponseDto })
  async resolveReport(
    @Req() req: AuthorizedRequest,
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReviewReportDto,
  ) {
    const data = await this.operationsReviewService.resolveReport(
      req.organization.organizationId,
      req.user.id,
      reportId,
      dto,
    );
    return createSuccessResponse(data);
  }

  @Post('review-reports/:reportId/dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dismiss a review abuse report' })
  @ApiResponse({ status: 200, type: ReviewReportResponseDto })
  async dismissReport(
    @Req() req: AuthorizedRequest,
    @Param('reportId') reportId: string,
    @Body() dto: DismissReviewReportDto,
  ) {
    const data = await this.operationsReviewService.dismissReport(
      req.organization.organizationId,
      req.user.id,
      reportId,
      dto,
    );
    return createSuccessResponse(data);
  }
}
