import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '../types/financial.types';

export class TransactionResponseDto {
  @ApiProperty({ description: 'Internal transaction UUID' })
  id!: string;

  @ApiProperty({ description: 'Human-readable public transaction ID', example: 'TXN-2026-000001' })
  publicId!: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId!: string;

  @ApiPropertyOptional({ description: 'Booking ID' })
  bookingId?: string | null;

  @ApiPropertyOptional({ description: 'Payment ID' })
  paymentId?: string | null;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType, example: TransactionType.PAYMENT })
  type!: TransactionType;

  @ApiProperty({ description: 'Transaction amount', example: '1250.00' })
  amount!: string;

  @ApiProperty({ description: 'Currency code', example: 'INR' })
  currency!: string;

  @ApiProperty({ description: 'Transaction status', enum: TransactionStatus, example: TransactionStatus.COMPLETED })
  status!: TransactionStatus;

  @ApiPropertyOptional({ description: 'External reference number' })
  referenceNumber?: string | null;

  @ApiProperty({ description: 'Description / journal memo', example: 'Payment capture for booking WAS-2026-000001' })
  description!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;
}
