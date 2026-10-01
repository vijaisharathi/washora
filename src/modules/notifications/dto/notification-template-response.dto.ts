import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationChannel } from '../types/notifications.types';

export class NotificationTemplateResponseDto {
  @ApiProperty({ example: 'c1f9e612-5eb3-4638-b719-74d75f284e91' })
  id!: string;

  @ApiProperty({ example: 'TMP-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'b6f9e612-5eb3-4638-b719-74d75f284e90' })
  organizationId!: string;

  @ApiProperty({ example: 'BOOKING_CONFIRMED' })
  type!: string;

  @ApiProperty({ enum: CommunicationChannel, example: CommunicationChannel.IN_APP })
  channel!: CommunicationChannel;

  @ApiPropertyOptional({ example: 'Booking Confirmation - {{bookingNumber}}' })
  subject?: string | null;

  @ApiProperty({ example: 'Booking Confirmed: {{bookingNumber}}' })
  titleTemplate!: string;

  @ApiProperty({ example: 'Hello {{customerName}}, your booking for {{serviceName}} is confirmed.' })
  bodyTemplate!: string;

  @ApiProperty({ example: 1 })
  version!: number;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-12T09:00:00.000Z' })
  updatedAt!: Date;
}
