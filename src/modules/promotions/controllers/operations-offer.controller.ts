import {
  Body,
  Controller,
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
  CreateOfferDto,
  OfferListQueryDto,
  OfferRedemptionResponseDto,
  OfferResponseDto,
  UpdateOfferDto,
} from '../dto';
import { OfferService } from '../services/offer.service';

@ApiTags('Operations Promotional Offers Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.OPERATIONS, RoleType.ADMIN)
@Controller('operations/offers')
export class OperationsOfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new promotional offer' })
  @ApiResponse({ status: 201, description: 'Offer created', type: OfferResponseDto })
  async createOffer(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateOfferDto,
  ) {
    const data = await this.offerService.createOffer(
      req.organization.organizationId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Get()
  @ApiOperation({ summary: 'List tenant promotional offers with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated offers', type: [OfferResponseDto] })
  async getOffers(
    @Req() req: AuthorizedRequest,
    @Query() query: OfferListQueryDto,
  ) {
    const result = await this.offerService.getOffers(
      req.organization.organizationId,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.limit,
      result.total,
    );
  }

  @Get(':offerId')
  @ApiOperation({ summary: 'Get offer details by ID or publicId' })
  @ApiResponse({ status: 200, description: 'Offer detail', type: OfferResponseDto })
  async getOffer(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
  ) {
    const data = await this.offerService.getOffer(
      req.organization.organizationId,
      offerId,
    );
    return createSuccessResponse(data);
  }

  @Patch(':offerId')
  @ApiOperation({ summary: 'Update promotional offer properties' })
  @ApiResponse({ status: 200, description: 'Offer updated', type: OfferResponseDto })
  async updateOffer(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
    @Body() dto: UpdateOfferDto,
  ) {
    const data = await this.offerService.updateOffer(
      req.organization.organizationId,
      offerId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Post(':offerId/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a DRAFT or PAUSED promotional offer' })
  @ApiResponse({ status: 200, description: 'Offer activated', type: OfferResponseDto })
  async activateOffer(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
  ) {
    const data = await this.offerService.activateOffer(
      req.organization.organizationId,
      offerId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Post(':offerId/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause an ACTIVE promotional offer' })
  @ApiResponse({ status: 200, description: 'Offer paused', type: OfferResponseDto })
  async pauseOffer(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
  ) {
    const data = await this.offerService.pauseOffer(
      req.organization.organizationId,
      offerId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Post(':offerId/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable a promotional offer permanently' })
  @ApiResponse({ status: 200, description: 'Offer disabled', type: OfferResponseDto })
  async disableOffer(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
  ) {
    const data = await this.offerService.disableOffer(
      req.organization.organizationId,
      offerId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Get(':offerId/redemptions')
  @ApiOperation({ summary: 'List redemptions for a specific offer' })
  @ApiResponse({
    status: 200,
    description: 'Paginated offer redemptions',
    type: [OfferRedemptionResponseDto],
  })
  async getOfferRedemptions(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.offerService.getOfferRedemptions(
      req.organization.organizationId,
      offerId,
      Number(page) || 1,
      Number(limit) || 20,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.limit,
      result.total,
    );
  }
}
