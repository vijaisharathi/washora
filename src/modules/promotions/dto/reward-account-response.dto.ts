import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardAccountStatus } from '../types/promotions.types';

export class RewardAccountResponseDto {
  @ApiProperty({ example: 'acc-uuid-1' })
  id!: string;

  @ApiPropertyOptional({ example: 'REW-2026-000001' })
  publicId?: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  organizationId!: string;

  @ApiProperty({ example: 'cus-uuid-1' })
  customerId!: string;

  @ApiPropertyOptional({ example: 'CUS-2026-000001' })
  customerPublicId?: string;

  @ApiPropertyOptional({ example: 'Arun Kumar' })
  customerName?: string;

  @ApiProperty({ example: 450, description: 'Available redeemable points balance' })
  pointsBalance!: number;

  @ApiProperty({ example: 1200, description: 'Total points earned over account lifetime' })
  lifetimeEarned!: number;

  @ApiProperty({ example: 750, description: 'Total points redeemed over account lifetime' })
  lifetimeRedeemed!: number;

  @ApiProperty({ enum: RewardAccountStatus, example: RewardAccountStatus.ACTIVE })
  status!: RewardAccountStatus;

  @ApiProperty({ example: '2026-09-01T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  updatedAt!: Date;
}
