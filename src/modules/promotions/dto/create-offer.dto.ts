import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { DiscountType, OfferType } from '../types/promotions.types';

export class CreateOfferDto {
  @ApiProperty({
    description: 'Title / name of promotional offer',
    example: 'Welcome 20% Off',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    description: 'Promotional banner text shown in customer app',
    example: 'Save 20% on your first order with Washora!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bannerText?: string;

  @ApiPropertyOptional({
    description: 'Banner image URL',
    example: 'https://washora.com/offers/welcome.png',
  })
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Offer type / category',
    enum: OfferType,
    example: OfferType.WELCOME,
    default: OfferType.GENERAL,
  })
  @IsOptional()
  @IsEnum(OfferType)
  offerType?: OfferType;

  @ApiProperty({
    description: 'Discount type: PERCENTAGE or FIXED_AMOUNT',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({
    description: 'Discount value',
    example: '20.00',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'discountValue must be a valid positive decimal up to 2 decimal places',
  })
  discountValue!: string;

  @ApiPropertyOptional({
    description: 'Minimum order amount to qualify',
    example: '400.00',
    default: '0.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'minimumOrderValue must be a valid non-negative decimal up to 2 decimal places',
  })
  minimumOrderValue?: string;

  @ApiPropertyOptional({
    description: 'Maximum discount amount cap',
    example: '200.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'maximumDiscountAmount must be a valid positive decimal up to 2 decimal places',
  })
  maximumDiscountAmount?: string;

  @ApiProperty({
    description: 'Valid from timestamp (ISO 8601)',
    example: '2026-09-01T00:00:00.000Z',
  })
  @IsDateString()
  startAt!: string;

  @ApiProperty({
    description: 'Valid until timestamp (ISO 8601)',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsDateString()
  endAt!: string;

  @ApiPropertyOptional({
    description: 'Global usage limit',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  usageLimit?: number;

  @ApiPropertyOptional({
    description: 'Per customer usage limit',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  perCustomerLimit?: number;

  @ApiPropertyOptional({
    description: 'Targeted Service ID (for SERVICE_SPECIFIC)',
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Targeted Category ID (for CATEGORY_SPECIFIC)',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
