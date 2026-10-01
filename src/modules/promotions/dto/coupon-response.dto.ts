import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponStatus, DiscountType } from '../types/promotions.types';

export class CouponResponseDto {
  @ApiProperty({ example: 'b0f81d11-5d9c-4f18-bc1e-8123e4567890' })
  id!: string;

  @ApiProperty({ example: 'CPN-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  organizationId!: string;

  @ApiProperty({ example: 'WASHORA10' })
  code!: string;

  @ApiProperty({ example: '10% Off First Booking' })
  name!: string;

  @ApiPropertyOptional({ example: 'Valid for all laundry services' })
  description?: string | null;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  discountType!: DiscountType;

  @ApiProperty({ example: '10.00' })
  discountValue!: string;

  @ApiProperty({ example: '500.00' })
  minimumOrderValue!: string;

  @ApiPropertyOptional({ example: '250.00' })
  maximumDiscountAmount?: string | null;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  startAt!: Date;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  endAt!: Date;

  @ApiPropertyOptional({ example: 500 })
  usageLimit?: number | null;

  @ApiPropertyOptional({ example: 1 })
  perCustomerLimit?: number | null;

  @ApiProperty({ example: 42 })
  usageCount!: number;

  @ApiProperty({ enum: CouponStatus, example: CouponStatus.ACTIVE })
  status!: CouponStatus;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })
  updatedAt!: Date;
}

export class CouponRedemptionResponseDto {
  @ApiProperty({ example: 'c1f81d11-5d9c-4f18-bc1e-8123e4567890' })
  id!: string;

  @ApiProperty({ example: 'b0f81d11-5d9c-4f18-bc1e-8123e4567890' })
  couponId!: string;

  @ApiProperty({ example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  customerId!: string;

  @ApiProperty({ example: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  bookingId!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  organizationId!: string;

  @ApiProperty({ example: '125.00' })
  discountAmount!: string;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  redeemedAt!: Date;
}
