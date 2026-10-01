import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardTransactionStatus, RewardTransactionType } from '../types/promotions.types';

export class RewardTransactionResponseDto {
  @ApiProperty({ example: 'tx-uuid-1' })
  id!: string;

  @ApiProperty({ example: 'acc-uuid-1' })
  rewardAccountId!: string;

  @ApiProperty({ example: 'cus-uuid-1' })
  customerId!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  organizationId!: string;

  @ApiPropertyOptional({ example: 'WAS-2026-000001' })
  bookingId?: string | null;

  @ApiProperty({ enum: RewardTransactionType, example: RewardTransactionType.EARNED })
  type!: RewardTransactionType;

  @ApiProperty({ example: 50, description: 'Point change: positive for credits, negative for debits' })
  points!: number;

  @ApiProperty({ example: 450, description: 'Points balance immediately after this transaction' })
  balanceAfter!: number;

  @ApiProperty({ example: 'Earned 10 points on order completion #WAS-2026-000001' })
  description!: string;

  @ApiProperty({ enum: RewardTransactionStatus, example: RewardTransactionStatus.COMPLETED })
  status!: RewardTransactionStatus;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  createdAt!: Date;
}
