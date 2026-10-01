import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SupportCategory,
  SupportPriority,
  SupportRequesterType,
  SupportStatus,
} from '../types/support.types';

export class SupportTicketResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'SUP-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  organizationId!: string;

  @ApiProperty({ enum: SupportRequesterType, example: SupportRequesterType.CUSTOMER })
  requesterType!: SupportRequesterType;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  createdByUserId?: string | null;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  customerId?: string | null;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  providerId?: string | null;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  deliveryPartnerId?: string | null;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  bookingId?: string | null;

  @ApiPropertyOptional({ example: 'WAS-2026-000001' })
  bookingNumber?: string | null;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  paymentId?: string | null;

  @ApiPropertyOptional({ example: 'PAY-2026-000001' })
  paymentPublicId?: string | null;

  @ApiProperty({ enum: SupportCategory, example: SupportCategory.BOOKING })
  category!: SupportCategory;

  @ApiProperty({ enum: SupportPriority, example: SupportPriority.MEDIUM })
  priority!: SupportPriority;

  @ApiProperty({ enum: SupportStatus, example: SupportStatus.OPEN })
  status!: SupportStatus;

  @ApiProperty({ example: 'Issue with booking schedule' })
  subject!: string;

  @ApiProperty({ example: 'The requested service was not started on time...' })
  description!: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  assignedToUserId?: string | null;

  @ApiPropertyOptional({ example: 'Agent Sarah' })
  assigneeName?: string | null;

  @ApiPropertyOptional()
  resolvedAt?: Date | null;

  @ApiPropertyOptional()
  resolutionNote?: string | null;

  @ApiPropertyOptional()
  closedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ example: 4 })
  messagesCount?: number;

  @ApiPropertyOptional({ example: 2 })
  notesCount?: number;
}
