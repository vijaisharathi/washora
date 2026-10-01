import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { DiscountType } from '../types/promotions.types';

export class UpdateCouponDto {
  @ApiPropertyOptional({
    description: 'Display name / title of the coupon',
    example: '15% Off Monsoon Special',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of terms and conditions',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Discount type: PERCENTAGE or FIXED_AMOUNT',
    enum: DiscountType,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({
    description: 'Discount value',
    example: '15.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'discountValue must be a valid positive decimal up to 2 decimal places',
  })
  discountValue?: string;

  @ApiPropertyOptional({
    description: 'Minimum order value required',
    example: '600.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'minimumOrderValue must be a valid non-negative decimal up to 2 decimal places',
  })
  minimumOrderValue?: string;

  @ApiPropertyOptional({
    description: 'Maximum cap on discount amount',
    example: '300.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'maximumDiscountAmount must be a valid positive decimal up to 2 decimal places',
  })
  maximumDiscountAmount?: string;

  @ApiPropertyOptional({
    description: 'Coupon start timestamp (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({
    description: 'Coupon expiration timestamp (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({
    description: 'Global maximum redemptions',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  usageLimit?: number;

  @ApiPropertyOptional({
    description: 'Per customer limit',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  perCustomerLimit?: number;
}
