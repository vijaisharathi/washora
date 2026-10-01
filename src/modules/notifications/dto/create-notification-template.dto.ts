import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CommunicationChannel } from '../types/notifications.types';

export class CreateNotificationTemplateDto {
  @ApiProperty({
    example: 'BOOKING_CONFIRMED',
    description: 'Notification type code (e.g. BOOKING_CONFIRMED, ORDER_STATUS)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  type!: string;

  @ApiProperty({
    enum: CommunicationChannel,
    example: CommunicationChannel.IN_APP,
    description: 'Delivery channel for template',
  })
  @IsEnum(CommunicationChannel)
  channel!: CommunicationChannel;

  @ApiPropertyOptional({
    example: 'Booking Confirmation - {{bookingNumber}}',
    description: 'Email/message subject template',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({
    example: 'Booking Confirmed: {{bookingNumber}}',
    description: 'Title template string with whitelisted variable interpolations',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  titleTemplate!: string;

  @ApiProperty({
    example: 'Hello {{customerName}}, your booking for {{serviceName}} is confirmed for {{pickupTime}}.',
    description: 'Body template text with whitelisted variable interpolations',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(5000)
  bodyTemplate!: string;
}
