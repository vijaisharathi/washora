import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class RewardRedeemDto {
  @ApiProperty({ example: 'WAS-2026-000001', description: 'Booking ID or bookingNumber' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({
    example: 100,
    description: 'Number of points to redeem (100 points = ₹10 discount => 10 points = ₹1)',
  })
  @IsInt()
  @IsPositive()
  points!: number;
}

export class RewardRedeemResponseDto {
  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingId!: string;

  @ApiProperty({ example: 100 })
  pointsRedeemed!: number;

  @ApiProperty({ example: '10.00', description: 'Discount applied from points in INR' })
  rewardDiscount!: string;

  @ApiProperty({ example: 450, description: 'Remaining customer points balance' })
  remainingPointsBalance!: number;

  @ApiProperty({ example: '740.00', description: 'Updated canonical booking total' })
  finalBookingAmount!: string;

  @ApiProperty({ example: 'tx-uuid-1' })
  transactionId!: string;
}
