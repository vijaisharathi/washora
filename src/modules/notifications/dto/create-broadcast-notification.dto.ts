import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  CommunicationChannel,
  NotificationPriority,
  RecipientType,
} from '../types/notifications.types';

export class CreateBroadcastNotificationDto {
  @ApiProperty({
    enum: RecipientType,
    example: RecipientType.ALL,
    description: 'Target audience for broadcast',
  })
  @IsEnum(RecipientType)
  recipientType!: RecipientType;

  @ApiProperty({
    example: 'Scheduled Maintenance Alert',
    description: 'Broadcast title (3-150 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  title!: string;

  @ApiProperty({
    example: 'Platform maintenance scheduled for Sunday 2 AM to 4 AM IST.',
    description: 'Broadcast message body (10-2000 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;

  @ApiPropertyOptional({
    enum: NotificationPriority,
    example: NotificationPriority.HIGH,
    default: NotificationPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.MEDIUM;

  @ApiPropertyOptional({
    enum: CommunicationChannel,
    isArray: true,
    example: [CommunicationChannel.IN_APP],
    default: [CommunicationChannel.IN_APP],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(CommunicationChannel, { each: true })
  channels?: CommunicationChannel[] = [CommunicationChannel.IN_APP];

  @ApiPropertyOptional({ example: '/announcements/maintenance-2026' })
  @IsOptional()
  @IsString()
  linkUrl?: string;
}
