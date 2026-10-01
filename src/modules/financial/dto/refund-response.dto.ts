import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RefundStatus } from '../types/financial.types';

export class RefundResponseDto {
  @ApiProperty({ description: 'Internal refund UUID' })
  id!: string;

  @ApiProperty({ description: 'Human-readable public refund ID', example: 'REF-2026-000001' })
  publicId!: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId!: string;

  @ApiProperty({ description: 'Associated booking ID' })
  bookingId!: string;

  @ApiProperty({ description: 'Associated payment ID' })
  paymentId!: string;

  @ApiPropertyOptional({ description: 'Associated ledger transaction ID' })
  transactionId?: string | null;

  @ApiProperty({ description: 'Refund amount', example: '250.00' })
  amount!: string;

  @ApiProperty({ description: 'Currency code', example: 'INR' })
  currency!: string;

  @ApiProperty({ description: 'Refund status', enum: RefundStatus, example: RefundStatus.PENDING })
  status!: RefundStatus;

  @ApiProperty({ description: 'Reason for refund' })
  reason!: string;

  @ApiPropertyOptional({ description: 'Gateway refund reference' })
  gatewayRefundRef?: string | null;

  @ApiPropertyOptional({ description: 'User ID of operator who processed the refund' })
  processedByUserId?: string | null;

  @ApiPropertyOptional({ description: 'Timestamp when refund was processed' })
  processedAt?: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}
