import { ApiProperty } from '@nestjs/swagger';

export class PricingCalculationDto {
  @ApiProperty({ example: '1500.00' })
  subtotal!: string;

  @ApiProperty({ example: '0.00' })
  serviceFee!: string;

  @ApiProperty({ example: '0.00' })
  taxAmount!: string;

  @ApiProperty({ example: '150.00', description: 'Discount from active coupon or promotional offer' })
  promotionDiscount!: string;

  @ApiProperty({ example: '50.00', description: 'Discount from redeemed reward points' })
  rewardDiscount!: string;

  @ApiProperty({ example: '200.00', description: 'Sum of promotion and reward discounts' })
  totalDiscount!: string;

  @ApiProperty({ example: '1300.00', description: 'Final authoritative payable amount (>= 0.00)' })
  finalAmount!: string;
}
