import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, OfferStatus, OfferType } from '../types/promotions.types';

export class OfferResponseDto {
  @ApiProperty({ example: 'f0f81d11-5d9c-4f18-bc1e-8123e4567890' })
  id!: string;

  @ApiProperty({ example: 'OFF-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  organizationId!: string;

  @ApiProperty({ example: 'Welcome 20% Off' })
  name!: string;

  @ApiPropertyOptional({ example: 'Save 20% on your first order with Washora!' })
  bannerText?: string | null;

  @ApiPropertyOptional({ example: 'https://washora.com/offers/welcome.png' })
  bannerImageUrl?: string | null;

  @ApiProperty({ enum: OfferType, example: OfferType.WELCOME })
  offerType!: OfferType;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  discountType!: DiscountType;

  @ApiProperty({ example: '20.00' })
  discountValue!: string;

  @ApiProperty({ example: '400.00' })
  minimumOrderValue!: string;

  @ApiPropertyOptional({ example: '200.00' })
  maximumDiscountAmount?: string | null;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  startAt!: Date;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  endAt!: Date;

  @ApiPropertyOptional({ example: 1000 })
  usageLimit?: number | null;

  @ApiPropertyOptional({ example: 1 })
  perCustomerLimit?: number | null;

  @ApiProperty({ example: 88 })
  usageCount!: number;

  @ApiProperty({ enum: OfferStatus, example: OfferStatus.ACTIVE })
  status!: OfferStatus;

  @ApiPropertyOptional({ example: 'srv-uuid-1' })
  serviceId?: string | null;

  @ApiPropertyOptional({ example: 'cat-uuid-1' })
  categoryId?: string | null;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })
  updatedAt!: Date;
}

export class OfferRedemptionResponseDto {
  @ApiProperty({ example: 'd1f81d11-5d9c-4f18-bc1e-8123e4567890' })
  id!: string;

  @ApiProperty({ example: 'f0f81d11-5d9c-4f18-bc1e-8123e4567890' })
  offerId!: string;

  @ApiProperty({ example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  customerId!: string;

  @ApiProperty({ example: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  bookingId!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  organizationId!: string;

  @ApiProperty({ example: '150.00' })
  discountAmount!: string;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  redeemedAt!: Date;
}
