import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notifications.types';

export class NotificationResponseDto {
  @ApiProperty({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e91' })
  id!: string;

  @ApiProperty({ example: 'NOT-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e90' })
  organizationId!: string;

  @ApiProperty({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e92' })
  recipientUserId!: string;

  @ApiProperty({ enum: NotificationType, example: 'ORDER_STATUS' })
  type!: NotificationType;

  @ApiProperty({ example: 'Booking Confirmed' })
  title!: string;

  @ApiProperty({ example: 'Your booking WAS-2026-000001 has been confirmed.' })
  message!: string;

  @ApiProperty({ enum: NotificationPriority, example: 'MEDIUM' })
  priority!: NotificationPriority;

  @ApiProperty({ enum: NotificationStatus, example: 'UNREAD' })
  status!: NotificationStatus;

  @ApiPropertyOptional({ example: '/bookings/WAS-2026-000001' })
  linkUrl?: string | null;

  @ApiPropertyOptional({ example: { bookingId: 'WAS-2026-000001' } })
  data?: any;

  @ApiPropertyOptional({ example: '2026-09-12T10:00:00.000Z' })
  readAt?: Date | null;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  updatedAt!: Date;
}
