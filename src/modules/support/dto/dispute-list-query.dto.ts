import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  DisputeStatus,
  DisputeType,
  SupportPriority,
} from '../types/support.types';

export class DisputeListQueryDto {
  @ApiPropertyOptional({ enum: DisputeStatus })
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @ApiPropertyOptional({ enum: SupportPriority })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;

  @ApiPropertyOptional({ enum: DisputeType })
  @IsOptional()
  @IsEnum(DisputeType)
  category?: DisputeType;

  @ApiPropertyOptional({ description: 'Filter by assignee user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Filter by customer public ID or UUID' })
  @IsOptional()
  @IsString()
  customer?: string;

  @ApiPropertyOptional({ description: 'Filter by provider public ID or UUID' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Filter by delivery partner public ID or UUID' })
  @IsOptional()
  @IsString()
  deliveryPartner?: string;

  @ApiPropertyOptional({ description: 'Filter by booking number or UUID' })
  @IsOptional()
  @IsString()
  booking?: string;

  @ApiPropertyOptional({ description: 'Filter by payment public ID or UUID' })
  @IsOptional()
  @IsString()
  payment?: string;

  @ApiPropertyOptional({ description: 'Filter by creation date from (ISO 8601)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter by creation date to (ISO 8601)' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Search term for dispute reason or public ID' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ default: 'priority', enum: ['priority', 'createdAt', 'updatedAt'] })
  @IsOptional()
  @IsIn(['priority', 'createdAt', 'updatedAt'])
  sortBy?: string = 'priority';

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
