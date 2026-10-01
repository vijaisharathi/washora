import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RoleType } from '@prisma/client';

export enum AnalyticsInterval {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start timestamp (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End timestamp (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: AnalyticsInterval, default: AnalyticsInterval.DAILY })
  @IsOptional()
  @IsEnum(AnalyticsInterval)
  interval?: AnalyticsInterval = AnalyticsInterval.DAILY;

  @ApiPropertyOptional({ enum: RoleType })
  @IsOptional()
  @IsEnum(RoleType)
  targetRole?: RoleType;

  @ApiPropertyOptional({ description: 'Specific service or category filter' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ description: 'Provider ID for localized performance drilldown' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(250)
  limit?: number = 50;
}
