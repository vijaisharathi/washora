import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardTransactionType } from '@prisma/client';

export class CustomerRewardAccountResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Reward account UUID' })
  id!: string;

  @ApiProperty({ example: 1200, description: 'Available points balance' })
  pointsBalance!: number;

  @ApiProperty({ example: 3500, description: 'Total lifetime points earned' })
  lifetimeEarned!: number;

  @ApiProperty({ example: 2300, description: 'Total lifetime points redeemed' })
  lifetimeRedeemed!: number;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'Last update timestamp' })
  updatedAt!: Date;
}

export class CustomerRewardTransactionResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Transaction UUID' })
  id!: string;

  @ApiProperty({ enum: RewardTransactionType, example: RewardTransactionType.EARNED, description: 'Transaction type' })
  type!: RewardTransactionType;

  @ApiProperty({ example: 150, description: 'Points credited or debited' })
  points!: number;

  @ApiProperty({ example: 1200, description: 'Points balance after transaction' })
  balanceAfter!: number;

  @ApiProperty({ example: 'Points earned for booking WAS-2026-000001', description: 'Transaction description' })
  description!: string;

  @ApiPropertyOptional({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Associated booking UUID', nullable: true })
  bookingId!: string | null;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Transaction timestamp' })
  createdAt!: Date;
}
