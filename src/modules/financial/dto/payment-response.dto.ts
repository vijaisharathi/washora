import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../types/financial.types';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Internal payment UUID', example: 'd3b07384-d113-4679-b1ff-349896c21e53' })
  id!: string;

  @ApiProperty({ description: 'Human-readable public payment ID', example: 'PAY-2026-000001' })
  publicId!: string;

  @ApiProperty({ description: 'Organization ID', example: 'd3b07384-d113-4679-b1ff-349896c21e53' })
  organizationId!: string;

  @ApiProperty({ description: 'Booking ID', example: 'd3b07384-d113-4679-b1ff-349896c21e53' })
  bookingId!: string;

  @ApiPropertyOptional({ description: 'Customer ID associated with booking' })
  customerId?: string;

  @ApiProperty({ description: 'Payment amount', example: '1250.00' })
  amount!: string;

  @ApiProperty({ description: 'Currency code', example: 'INR' })
  currency!: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod, example: PaymentMethod.UPI })
  method!: PaymentMethod;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus, example: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @ApiPropertyOptional({ description: 'Gateway payment reference' })
  gatewayRef?: string | null;

  @ApiPropertyOptional({ description: 'Gateway name', example: 'MOCK' })
  gatewayName?: string | null;

  @ApiPropertyOptional({ description: 'Timestamp when payment was marked paid' })
  paidAt?: Date | null;

  @ApiPropertyOptional({ description: 'Failure reason if payment failed' })
  failureReason?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}
