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
  CouponListQueryDto,
  CouponRedemptionResponseDto,
  CouponResponseDto,
  CreateCouponDto,
  UpdateCouponDto,
} from '../dto';
import { CouponService } from '../services/coupon.service';

@ApiTags('Operations Coupons Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.OPERATIONS, RoleType.ADMIN)
@Controller('operations/coupons')
export class OperationsCouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new coupon for the organization' })
  @ApiResponse({ status: 201, description: 'Coupon created', type: CouponResponseDto })
  async createCoupon(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateCouponDto,
  ) {
    const data = await this.couponService.createCoupon(
      req.organization.organizationId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Get()
  @ApiOperation({ summary: 'List tenant coupons with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated coupons', type: [CouponResponseDto] })
  async getCoupons(
    @Req() req: AuthorizedRequest,
    @Query() query: CouponListQueryDto,
  ) {
    const result = await this.couponService.getCoupons(
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

  @Get(':couponId')
  @ApiOperation({ summary: 'Get coupon details by ID or publicId' })
  @ApiResponse({ status: 200, description: 'Coupon detail', type: CouponResponseDto })
  async getCoupon(
    @Req() req: AuthorizedRequest,
    @Param('couponId') couponId: string,
  ) {
    const data = await this.couponService.getCoupon(
      req.organization.organizationId,
      couponId,
    );
    return createSuccessResponse(data);
  }

  @Patch(':couponId')
  @ApiOperation({ summary: 'Update coupon properties' })
  @ApiResponse({ status: 200, description: 'Coupon updated', type: CouponResponseDto })
  async updateCoupon(
    @Req() req: AuthorizedRequest,
    @Param('couponId') couponId: string,
    @Body() dto: UpdateCouponDto,
  ) {
    const data = await this.couponService.updateCoupon(
      req.organization.organizationId,
      couponId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Post(':couponId/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a DRAFT or PAUSED coupon' })
  @ApiResponse({ status: 200, description: 'Coupon activated', type: CouponResponseDto })
  async activateCoupon(
    @Req() req: AuthorizedRequest,
    @Param('couponId') couponId: string,
  ) {
    const data = await this.couponService.activateCoupon(
      req.organization.organizationId,
      couponId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Post(':couponId/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause an ACTIVE coupon' })
  @ApiResponse({ status: 200, description: 'Coupon paused', type: CouponResponseDto })
  async pauseCoupon(
    @Req() req: AuthorizedRequest,
    @Param('couponId') couponId: string,
  ) {
    const data = await this.couponService.pauseCoupon(
      req.organization.organizationId,
      couponId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Post(':couponId/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable a coupon permanently' })
  @ApiResponse({ status: 200, description: 'Coupon disabled', type: CouponResponseDto })
  async disableCoupon(
    @Req() req: AuthorizedRequest,
    @Param('couponId') couponId: string,
  ) {
    const data = await this.couponService.disableCoupon(
      req.organization.organizationId,
      couponId,
      req.user.id,
    );
    return createSuccessResponse(data);
  }

  @Get(':couponId/redemptions')
  @ApiOperation({ summary: 'List redemptions for a specific coupon' })
  @ApiResponse({
    status: 200,
    description: 'Paginated coupon redemptions',
    type: [CouponRedemptionResponseDto],
  })
  async getCouponRedemptions(
    @Req() req: AuthorizedRequest,
    @Param('couponId') couponId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.couponService.getCouponRedemptions(
      req.organization.organizationId,
      couponId,
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
