import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { DiscountType } from '../types/promotions.types';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Coupon code (case-insensitive, normalized uppercase)',
    example: 'WASHORA10',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim().toUpperCase())
  code!: string;

  @ApiProperty({
    description: 'Display name / title of the coupon',
    example: '10% Off First Booking',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of terms and conditions',
    example: 'Valid for laundry services up to maximum discount of ₹200',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Discount type: PERCENTAGE or FIXED_AMOUNT',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({
    description: 'Discount value (percentage e.g. 10.00, or fixed currency e.g. 150.00)',
    example: '10.00',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'discountValue must be a valid positive decimal up to 2 decimal places',
  })
  discountValue!: string;

  @ApiPropertyOptional({
    description: 'Minimum booking order value required to apply coupon',
    example: '500.00',
    default: '0.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'minimumOrderValue must be a valid non-negative decimal up to 2 decimal places',
  })
  minimumOrderValue?: string;

  @ApiPropertyOptional({
    description: 'Maximum cap on discount amount for percentage discounts',
    example: '250.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'maximumDiscountAmount must be a valid positive decimal up to 2 decimal places',
  })
  maximumDiscountAmount?: string;

  @ApiProperty({
    description: 'Coupon start timestamp (ISO 8601)',
    example: '2026-09-01T00:00:00.000Z',
  })
  @IsDateString()
  startAt!: string;

  @ApiProperty({
    description: 'Coupon expiration timestamp (ISO 8601)',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsDateString()
  endAt!: string;

  @ApiPropertyOptional({
    description: 'Global maximum redemptions across all customers',
    example: 500,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  usageLimit?: number;

  @ApiPropertyOptional({
    description: 'Maximum allowed redemptions per customer',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  perCustomerLimit?: number;
}
