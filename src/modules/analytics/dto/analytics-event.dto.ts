import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { RoleType } from '@prisma/client';
import { AnalyticsEventCategory } from '../constants/event-taxonomy.constant';

export class IngestAnalyticsEventDto {
  @ApiProperty({ description: 'Canonical event name (e.g. customer.booking.initiated)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  eventName!: string;

  @ApiProperty({ enum: AnalyticsEventCategory })
  @IsEnum(AnalyticsEventCategory)
  eventCategory!: string;

  @ApiPropertyOptional({ enum: RoleType })
  @IsOptional()
  @IsEnum(RoleType)
  actorRole?: RoleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  anonymousId?: string;

  @ApiPropertyOptional({ description: 'Arbitrary event metadata without PII or plain secrets' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  deviceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  appVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  userAgent?: string;
}

export class BatchIngestAnalyticsEventsDto {
  @ApiProperty({ type: [IngestAnalyticsEventDto], description: 'Batch of up to 100 telemetry events' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngestAnalyticsEventDto)
  events!: IngestAnalyticsEventDto[];
}
