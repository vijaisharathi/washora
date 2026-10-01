import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
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
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type {
  AuthorizedRequest,
  OrganizationContext,
} from '../../authorization/types/authorization.types';
import {
  CreateReviewResponseDto,
  ReviewListQueryDto,
  ReviewResponseDto,
  ReviewSummaryDto,
  UpdateReviewResponseDto,
} from '../dto';
import { ProviderReviewService } from '../services/provider-review.service';

@ApiTags('Provider Reviews')
@Controller()
export class ProviderReviewController {
  constructor(private readonly providerReviewService: ProviderReviewService) {}

  // --------------------------------------------------------------------------
  // Public / Organization Scoped Provider Review Endpoints
  // --------------------------------------------------------------------------

  @Get('providers/:providerId/reviews')
  @UseGuards(OrganizationGuard)
  @ApiHeader({
    name: 'X-Organization-ID',
    description: 'Target Organization UUID or Public ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get published reviews for a provider' })
  @ApiResponse({ status: 200, description: 'Published reviews for provider' })
  async getProviderReviews(
    @CurrentOrganization() org: OrganizationContext,
    @Param('providerId') providerId: string,
    @Query() query: ReviewListQueryDto,
  ) {
    const data = await this.providerReviewService.getProviderPublicReviews(
      org.organizationId,
      providerId,
      query,
    );
    return createPaginatedResponse(
      data.items,
      data.meta.page,
      data.meta.pageSize,
      data.meta.total,
    );
  }

  @Get('providers/:providerId/review-summary')
  @UseGuards(OrganizationGuard)
  @ApiHeader({
    name: 'X-Organization-ID',
    description: 'Target Organization UUID or Public ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get rating summary (average & distribution) for a provider' })
  @ApiResponse({ status: 200, type: ReviewSummaryDto })
  async getProviderReviewSummary(
    @CurrentOrganization() org: OrganizationContext,
    @Param('providerId') providerId: string,
  ) {
    const data = await this.providerReviewService.getProviderReviewSummary(
      org.organizationId,
      providerId,
    );
    return createSuccessResponse(data);
  }

  // --------------------------------------------------------------------------
  // Authenticated Provider Self Review & Response Endpoints
  // --------------------------------------------------------------------------

  @Get('provider/reviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.PROVIDER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Provider self view of published reviews' })
  @ApiResponse({ status: 200, description: 'Provider review feed' })
  async getMyProviderReviews(
    @Req() req: AuthorizedRequest,
    @Query() query: ReviewListQueryDto,
  ) {
    const data = await this.providerReviewService.getProviderSelfReviews(
      req.organization.organizationId,
      req.user.id,
      query,
    );
    return createPaginatedResponse(
      data.items,
      data.meta.page,
      data.meta.pageSize,
      data.meta.total,
    );
  }

  @Get('provider/reviews/summary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.PROVIDER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Provider self rating summary' })
  @ApiResponse({ status: 200, type: ReviewSummaryDto })
  async getMyProviderSummary(@Req() req: AuthorizedRequest) {
    const data = await this.providerReviewService.getProviderSelfSummary(
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Get('provider/reviews/:reviewId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.PROVIDER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Provider self view of single review' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async getMyProviderReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    const data = await this.providerReviewService.getProviderSelfReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
    );
    return createSuccessResponse(data);
  }

  @Post('provider/reviews/:reviewId/response')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.PROVIDER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Submit provider response to a review' })
  @ApiResponse({ status: 201, description: 'Provider response created' })
  async createProviderResponse(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateReviewResponseDto,
  ) {
    const data = await this.providerReviewService.createProviderResponse(
      req.organization.organizationId,
      req.user.id,
      reviewId,
      dto,
    );
    return createSuccessResponse(data);
  }

  @Patch('provider/reviews/:reviewId/response')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.PROVIDER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Edit provider response to a review' })
  @ApiResponse({ status: 200, description: 'Provider response updated' })
  async updateProviderResponse(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewResponseDto,
  ) {
    const data = await this.providerReviewService.updateProviderResponse(
      req.organization.organizationId,
      req.user.id,
      reviewId,
      dto,
    );
    return createSuccessResponse(data);
  }

  @Delete('provider/reviews/:reviewId/response')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
  @Roles(RoleType.PROVIDER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Delete provider response to a review' })
  @ApiResponse({ status: 200, description: 'Provider response deleted' })
  async deleteProviderResponse(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    const data = await this.providerReviewService.deleteProviderResponse(
      req.organization.organizationId,
      req.user.id,
      reviewId,
    );
    return createSuccessResponse(data);
  }
}
