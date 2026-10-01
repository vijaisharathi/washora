import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DisputeOutcome,
  DisputeParticipantType,
  DisputeStatus,
  DisputeType,
  SupportPriority,
} from '../types/support.types';

export class DisputeResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'DSP-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  organizationId!: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  ticketId?: string | null;

  @ApiPropertyOptional({ example: 'SUP-2026-000001' })
  ticketPublicId?: string | null;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  bookingId!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  paymentId?: string | null;

  @ApiPropertyOptional({ example: 'PAY-2026-000001' })
  paymentPublicId?: string | null;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  createdByUserId?: string | null;

  @ApiProperty({ enum: DisputeParticipantType, example: DisputeParticipantType.CUSTOMER })
  raisedByType!: DisputeParticipantType;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  customerId?: string | null;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  providerId?: string | null;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  deliveryPartnerId?: string | null;

  @ApiProperty({ enum: DisputeType, example: DisputeType.SERVICE_QUALITY })
  category!: DisputeType;

  @ApiProperty({ enum: SupportPriority, example: SupportPriority.HIGH })
  priority!: SupportPriority;

  @ApiProperty({ enum: DisputeStatus, example: DisputeStatus.OPEN })
  status!: DisputeStatus;

  @ApiPropertyOptional({ example: '500.00' })
  claimAmount?: string | null;

  @ApiPropertyOptional({ example: '500.00' })
  resolvedAmount?: string | null;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiPropertyOptional({ enum: DisputeOutcome })
  outcome?: DisputeOutcome | null;

  @ApiPropertyOptional({ example: 'PARTIAL_REFUND' })
  resolutionType?: string | null;

  @ApiPropertyOptional({ example: 'Approved partial refund after evidence review.' })
  resolutionNote?: string | null;

  @ApiProperty({ example: 'The requested service was not completed properly.' })
  reason!: string;

  @ApiProperty({ example: 'Stains remain on three shirts after dry cleaning was completed.' })
  description!: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  assignedToUserId?: string | null;

  @ApiPropertyOptional({ example: 'Operations Lead Kumar' })
  assigneeName?: string | null;

  @ApiPropertyOptional()
  decisionReason?: string | null;

  @ApiPropertyOptional()
  resolvedAt?: Date | null;

  @ApiPropertyOptional()
  closedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ example: 2 })
  evidenceCount?: number;

  @ApiPropertyOptional({ example: 5 })
  messagesCount?: number;
}
