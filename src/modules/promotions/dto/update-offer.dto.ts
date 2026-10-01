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
import { DiscountType, OfferType } from '../types/promotions.types';

export class UpdateOfferDto {
  @ApiPropertyOptional({
    description: 'Title / name of promotional offer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    description: 'Promotional banner text',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bannerText?: string;

  @ApiPropertyOptional({
    description: 'Banner image URL',
  })
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Offer type',
    enum: OfferType,
  })
  @IsOptional()
  @IsEnum(OfferType)
  offerType?: OfferType;

  @ApiPropertyOptional({
    description: 'Discount type: PERCENTAGE or FIXED_AMOUNT',
    enum: DiscountType,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({
    description: 'Discount value',
    example: '25.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'discountValue must be a valid positive decimal up to 2 decimal places',
  })
  discountValue?: string;

  @ApiPropertyOptional({
    description: 'Minimum order amount',
    example: '500.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'minimumOrderValue must be a valid non-negative decimal up to 2 decimal places',
  })
  minimumOrderValue?: string;

  @ApiPropertyOptional({
    description: 'Maximum discount amount cap',
    example: '300.00',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'maximumDiscountAmount must be a valid positive decimal up to 2 decimal places',
  })
  maximumDiscountAmount?: string;

  @ApiPropertyOptional({
    description: 'Valid from timestamp (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({
    description: 'Valid until timestamp (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({
    description: 'Global usage limit',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  usageLimit?: number;

  @ApiPropertyOptional({
    description: 'Per customer limit',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  perCustomerLimit?: number;

  @ApiPropertyOptional({
    description: 'Targeted Service ID',
  })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Targeted Category ID',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
