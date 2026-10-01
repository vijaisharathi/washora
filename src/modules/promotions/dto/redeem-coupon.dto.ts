import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ValidateCouponResponseDto } from './validate-coupon.dto';

export class RedeemCouponDto {
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

export class RedeemCouponResponseDto extends ValidateCouponResponseDto {
  @ApiProperty({ example: 'c1f81d11-5d9c-4f18-bc1e-8123e4567890' })
  redemptionId!: string;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  redeemedAt!: Date;
}
