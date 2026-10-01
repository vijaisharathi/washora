import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  createPaginatedResponse,
  createSuccessResponse,
} from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { ReviewListQueryDto, ReviewResponseDto, ReviewSummaryDto } from '../dto';
import { CatalogReviewService } from '../services/catalog-review.service';

@ApiTags('Catalog Reviews')
@ApiHeader({
  name: 'X-Organization-ID',
  description: 'Target Organization UUID or Public ID (e.g. ORG-0001)',
  required: true,
})
@UseGuards(OrganizationGuard)
@Controller('catalog')
export class CatalogReviewController {
  constructor(private readonly catalogReviewService: CatalogReviewService) {}

  @Get('services/:serviceId/reviews')
  @ApiOperation({ summary: 'Get published reviews for a service' })
  @ApiResponse({ status: 200, description: 'Published service reviews' })
  async getServiceReviews(
    @CurrentOrganization() org: OrganizationContext,
    @Param('serviceId') serviceId: string,
    @Query() query: ReviewListQueryDto,
  ) {
    const data = await this.catalogReviewService.getServiceReviews(
      org.organizationId,
      serviceId,
      query,
    );
    return createPaginatedResponse(
      data.items,
      data.meta.page,
      data.meta.pageSize,
      data.meta.total,
    );
  }

  @Get('services/:serviceId/review-summary')
  @ApiOperation({ summary: 'Get rating summary (average & distribution) for a service' })
  @ApiResponse({ status: 200, type: ReviewSummaryDto })
  async getServiceReviewSummary(
    @CurrentOrganization() org: OrganizationContext,
    @Param('serviceId') serviceId: string,
  ) {
    const data = await this.catalogReviewService.getServiceReviewSummary(
      org.organizationId,
      serviceId,
    );
    return createSuccessResponse(data);
  }
}
