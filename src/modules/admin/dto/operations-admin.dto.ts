import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GlobalSearchQueryDto {
  @ApiProperty({ description: 'Search term across all platform entities' })
  @IsString()
  @IsNotEmpty()
  q!: string;

  @ApiPropertyOptional({ description: 'Filter by entity type (Customer, Provider, Booking, etc.)' })
  @IsOptional()
  @IsString()
  entityType?: string;
}


export class AuditEventQueryDto {
  @ApiPropertyOptional({ description: 'Filter by actor user ID' })
  @IsOptional()
  @IsString()
  actorUserId?: string;

  @ApiPropertyOptional({ description: 'Filter by action code' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type: Booking, Payment, Customer, etc.' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Filter by start date (ISO string)' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by end date (ISO string)' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by request correlation ID' })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit per page', default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ReportQueryDto {
  @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Time-series aggregation bucket: day, week, month', default: 'day' })
  @IsOptional()
  @IsString()
  grouping?: 'day' | 'week' | 'month' = 'day';

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class AdminBroadcastDto {
  @ApiProperty({ description: 'Audience selector: ALL, CUSTOMER, PROVIDER, DELIVERY_PARTNER, STAFF' })
  @IsString()
  @IsNotEmpty()
  audience!: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Notification message body' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ description: 'Category', default: 'SYSTEM' })
  @IsOptional()
  @IsString()
  category?: string = 'SYSTEM';

  @ApiPropertyOptional({ description: 'Channels to dispatch to: IN_APP, EMAIL, SMS, PUSH, WHATSAPP', type: [String] })
  @IsOptional()
  @IsArray()
  channels?: string[];
}
