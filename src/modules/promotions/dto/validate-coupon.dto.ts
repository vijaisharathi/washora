import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { DiscountType } from '../types/promotions.types';

export class ValidateCouponDto {
  @ApiProperty({ example: 'WASHORA10', description: 'Coupon code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim().toUpperCase())
  code!: string;

  @ApiProperty({ example: 'WAS-2026-000001', description: 'Booking ID or bookingNumber' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;
}

export class ValidateCouponResponseDto {
  @ApiProperty({ example: true })
  valid!: boolean;

  @ApiProperty({
    example: {
      code: 'WASHORA10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: '10.00',
    },
  })
  coupon!: {
    code: string;
    discountType: DiscountType;
    discountValue: string;
  };

  @ApiProperty({ example: '125.00' })
  discountAmount!: string;

  @ApiProperty({ example: '1125.00' })
  finalAmount!: string;
}
