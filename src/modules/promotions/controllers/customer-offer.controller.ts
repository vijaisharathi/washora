import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { createSuccessResponse } from '../../../common/utils/response.util';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { AuthorizedRequest } from '../../authorization/types/authorization.types';
import {
  OfferResponseDto,
  RedeemOfferDto,
  RedeemOfferResponseDto,
  ValidateOfferDto,
  ValidateOfferResponseDto,
} from '../dto';
import { OfferService } from '../services/offer.service';

@ApiTags('Customer Promotional Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer/offers')
export class CustomerOfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get()
  @ApiOperation({ summary: 'List eligible active promotional offers for customer' })
  @ApiResponse({ status: 200, description: 'List of active offers', type: [OfferResponseDto] })
  async getOffers(@Req() req: AuthorizedRequest) {
    const data = await this.offerService.getCustomerOffers(
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Get(':offerId')
  @ApiOperation({ summary: 'Get details of a promotional offer' })
  @ApiResponse({ status: 200, description: 'Offer details', type: OfferResponseDto })
  async getOffer(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
  ) {
    const data = await this.offerService.getCustomerOffer(
      req.organization.organizationId,
      req.user.id,
      offerId,
    );
    return createSuccessResponse(data);
  }

  @Post(':offerId/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate promotional offer against a customer booking' })
  @ApiResponse({
    status: 200,
    description: 'Offer is valid and discount calculated',
    type: ValidateOfferResponseDto,
  })
  async validateOffer(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
    @Body() dto: ValidateOfferDto,
  ) {
    const data = await this.offerService.validateCustomerOffer(
      req.organization.organizationId,
      req.user.id,
      offerId,
      dto,
    );
    return createSuccessResponse(data);
  }

  @Post(':offerId/redeem')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Atomically redeem a promotional offer for a customer booking' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique key for safe idempotent redemption',
  })
  @ApiResponse({
    status: 201,
    description: 'Offer redeemed successfully',
    type: RedeemOfferResponseDto,
  })
  async redeemOffer(
    @Req() req: AuthorizedRequest,
    @Param('offerId') offerId: string,
    @Body() dto: RedeemOfferDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const data = await this.offerService.redeemCustomerOffer(
      req.organization.organizationId,
      req.user.id,
      offerId,
      dto,
      idempotencyKey,
    );
    return createSuccessResponse(data);
  }
}
