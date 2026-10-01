import {
  Body,
  Controller,
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
  RedeemCouponDto,
  RedeemCouponResponseDto,
  ValidateCouponDto,
  ValidateCouponResponseDto,
} from '../dto';
import { CouponService } from '../services/coupon.service';

@ApiTags('Customer Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer')
export class CustomerCouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('coupons/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate coupon code against a customer booking' })
  @ApiResponse({
    status: 200,
    description: 'Coupon is valid and calculated discount returned',
    type: ValidateCouponResponseDto,
  })
  async validateCoupon(
    @Req() req: AuthorizedRequest,
    @Body() dto: ValidateCouponDto,
  ) {
    const data = await this.couponService.validateCustomerCoupon(
      req.organization.organizationId,
      req.user.id,
      dto,
    );
    return createSuccessResponse(data);
  }

  @Post('coupons/redeem')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Atomically redeem a coupon for a customer booking' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique key for safe idempotent redemption',
  })
  @ApiResponse({
    status: 201,
    description: 'Coupon redeemed successfully',
    type: RedeemCouponResponseDto,
  })
  async redeemCoupon(
    @Req() req: AuthorizedRequest,
    @Body() dto: RedeemCouponDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const data = await this.couponService.redeemCustomerCoupon(
      req.organization.organizationId,
      req.user.id,
      dto,
      idempotencyKey,
    );
    return createSuccessResponse(data);
  }

  @Post('bookings/:bookingId/coupon/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove applied coupon/promotion from customer booking' })
  @ApiResponse({ status: 200, description: 'Promotion removed and total restored' })
  async removeCoupon(
    @Req() req: AuthorizedRequest,
    @Param('bookingId') bookingId: string,
  ) {
    const data = await this.couponService.removeBookingCoupon(
      req.organization.organizationId,
      req.user.id,
      bookingId,
    );
    return createSuccessResponse(data);
  }
}
