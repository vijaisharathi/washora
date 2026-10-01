import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CommunicationChannel,
  CommunicationStatus,
  RecipientType,
} from '../types/notifications.types';

export class CommunicationRecipientResponseDto {
  @ApiProperty({ example: 'd1f9e612-5eb3-4638-b719-74d75f284e91' })
  id!: string;

  @ApiProperty({ enum: RecipientType, example: RecipientType.CUSTOMER })
  recipientType!: RecipientType;

  @ApiPropertyOptional({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e92' })
  userId?: string | null;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  channelAddress?: string | null;

  @ApiProperty({ enum: CommunicationStatus, example: CommunicationStatus.SENT })
  status!: CommunicationStatus;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiPropertyOptional({ example: '2026-09-12T10:00:00.000Z' })
  readAt?: Date | null;

  @ApiPropertyOptional({ example: '2026-09-12T09:05:00.000Z' })
  deliveredAt?: Date | null;

  @ApiPropertyOptional({ example: null })
  failedAt?: Date | null;

  @ApiPropertyOptional({ example: null })
  failureReason?: string | null;
}

export class CommunicationResponseDto {
  @ApiProperty({ example: 'e1f9e612-5eb3-4638-b719-74d75f284e91' })
  id!: string;

  @ApiProperty({ example: 'COM-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e90' })
  organizationId!: string;

  @ApiProperty({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e92' })
  senderUserId!: string;

  @ApiPropertyOptional({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e91' })
  notificationId?: string | null;

  @ApiProperty({ example: 'TRANSACTIONAL' })
  type!: string;

  @ApiProperty({ enum: CommunicationChannel, example: CommunicationChannel.EMAIL })
  channel!: CommunicationChannel;

  @ApiProperty({ example: 'Booking Confirmed' })
  subject!: string;

  @ApiProperty({ example: 'Your booking has been confirmed.' })
  body!: string;

  @ApiPropertyOptional({ example: '<p>Your booking has been confirmed.</p>' })
  content?: string | null;

  @ApiProperty({ enum: CommunicationStatus, example: CommunicationStatus.SENT })
  status!: CommunicationStatus;

  @ApiPropertyOptional({ example: 'MOCK_PROVIDER' })
  provider?: string | null;

  @ApiPropertyOptional({ example: 'msg_123456789' })
  providerMessageId?: string | null;

  @ApiProperty({ example: 1 })
  attemptCount!: number;

  @ApiPropertyOptional({ example: '2026-09-12T09:01:00.000Z' })
  lastAttemptAt?: Date | null;

  @ApiPropertyOptional({ example: null })
  failedAt?: Date | null;

  @ApiPropertyOptional({ example: null })
  failureReason?: string | null;

  @ApiPropertyOptional({ example: '2026-09-12T09:02:00.000Z' })
  sentAt?: Date | null;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: [CommunicationRecipientResponseDto] })
  recipients?: CommunicationRecipientResponseDto[];
}
