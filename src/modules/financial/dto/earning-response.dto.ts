import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EarningStatus, EarningTransactionType } from '../types/financial.types';

export class EarningTransactionResponseDto {
  @ApiProperty({ description: 'Internal earning transaction UUID' })
  id!: string;

  @ApiProperty({ description: 'Parent earning ID' })
  earningId!: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId!: string;

  @ApiPropertyOptional({ description: 'Associated ledger transaction ID' })
  transactionId?: string | null;

  @ApiProperty({ description: 'Earning transaction type', enum: EarningTransactionType })
  type!: EarningTransactionType;

  @ApiProperty({ description: 'Amount', example: '211.65' })
  amount!: string;

  @ApiProperty({ description: 'Currency code', example: 'INR' })
  currency!: string;

  @ApiPropertyOptional({ description: 'Notes or memos' })
  notes?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;
}

export class EarningResponseDto {
  @ApiProperty({ description: 'Internal earning UUID' })
  id!: string;

  @ApiProperty({ description: 'Human-readable public earning ID', example: 'ERN-2026-000001' })
  publicId!: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId!: string;

  @ApiProperty({ description: 'Booking ID' })
  bookingId!: string;

  @ApiPropertyOptional({ description: 'Provider ID if provider earning' })
  providerId?: string | null;

  @ApiPropertyOptional({ description: 'Delivery partner ID if delivery earning' })
  deliveryPartnerId?: string | null;

  @ApiProperty({ description: 'Gross earning amount before platform fees', example: '249.00' })
  grossAmount!: string;

  @ApiProperty({ description: 'Platform commission fee deducted', example: '37.35' })
  platformFee!: string;

  @ApiProperty({ description: 'Tax withheld amount', example: '0.00' })
  taxWithheld!: string;

  @ApiProperty({ description: 'Net earning amount payable', example: '211.65' })
  netAmount!: string;

  @ApiProperty({ description: 'Currency code', example: 'INR' })
  currency!: string;

  @ApiProperty({ description: 'Earning status', enum: EarningStatus, example: EarningStatus.AVAILABLE })
  status!: EarningStatus;

  @ApiPropertyOptional({ description: 'Payout date if settled' })
  payoutDate?: Date | null;

  @ApiPropertyOptional({ description: 'Payout reference or batch' })
  payoutRef?: string | null;

  @ApiPropertyOptional({ description: 'Earning transactions breakdowns', type: [EarningTransactionResponseDto] })
  transactions?: EarningTransactionResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}
