import {
  Body,
  Controller,
  Get,
  Headers,
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
import { Roles } from '../../authorization/decorators/roles.decorator';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { AuthorizedRequest } from '../../authorization/types/authorization.types';
import {
  CreateReviewDto,
  CreateReviewReportDto,
  ReviewListQueryDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from '../dto';
import { CustomerReviewService } from '../services/customer-review.service';

@ApiTags('Customer Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer')
export class CustomerReviewController {
  constructor(private readonly customerReviewService: CustomerReviewService) {}

  @Post('reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit review for completed booking' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique idempotency key for safe review submission retries',
  })
  @ApiResponse({
    status: 201,
    description: 'Review submitted successfully into PENDING moderation status',
    type: ReviewResponseDto,
  })
  async createReview(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateReviewDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    const data = await this.customerReviewService.createReview(
      req.organization.organizationId,
      req.user.id,
      dto,
      idempotencyKey,
    );
    return createSuccessResponse(data);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'List customer own reviews across all statuses' })
  @ApiResponse({ status: 200, description: 'Customer reviews list' })
  async getMyReviews(
    @Req() req: AuthorizedRequest,
    @Query() query: ReviewListQueryDto,
  ) {
    const data = await this.customerReviewService.getCustomerReviews(
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

  @Get('reviews/:reviewId')
  @ApiOperation({ summary: 'Get single review by ID owned by customer' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async getMyReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    const data = await this.customerReviewService.getCustomerReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
    );
    return createSuccessResponse(data);
  }

  @Get('bookings/:bookingId/review')
  @ApiOperation({ summary: 'Get review for specific booking owned by customer' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async getBookingReview(
    @Req() req: AuthorizedRequest,
    @Param('bookingId') bookingId: string,
  ) {
    const data = await this.customerReviewService.getBookingReview(
      req.organization.organizationId,
      req.user.id,
      bookingId,
    );
    return createSuccessResponse(data);
  }

  @Patch('reviews/:reviewId')
  @ApiOperation({ summary: 'Edit customer review (resets published review to PENDING)' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async editReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const data = await this.customerReviewService.editReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
      dto,
    );
    return createSuccessResponse(data);
  }

  @Post('reviews/:reviewId/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw customer review (sets status to WITHDRAWN)' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  async withdrawReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    const data = await this.customerReviewService.withdrawReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
    );
    return createSuccessResponse(data);
  }

  @Post('reviews/:reviewId/report')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report abuse or policy violation on a published review' })
  @ApiResponse({ status: 201, description: 'Abuse report created' })
  async reportReview(
    @Req() req: AuthorizedRequest,
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateReviewReportDto,
  ) {
    const data = await this.customerReviewService.reportReview(
      req.organization.organizationId,
      req.user.id,
      reviewId,
      dto,
    );
    return createSuccessResponse(data);
  }
}
