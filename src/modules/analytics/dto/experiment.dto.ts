import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { RoleType } from '@prisma/client';

export enum ExperimentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CONCLUDED = 'CONCLUDED',
  CANCELLED = 'CANCELLED',
}

export class ExperimentVariantDto {
  @ApiProperty({ example: 'control' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'Control (Standard)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 50, description: 'Relative allocation weight (e.g. 50)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  weight!: number;

  @ApiPropertyOptional({ description: 'Dynamic UI or feature flag config payload' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class CreateExperimentDto {
  @ApiProperty({ example: 'exp_checkout_one_click_v1' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'Streamlined One-Click Checkout Flow' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: RoleType, default: RoleType.CUSTOMER })
  @IsOptional()
  @IsEnum(RoleType)
  targetRole?: RoleType = RoleType.CUSTOMER;

  @ApiPropertyOptional({ default: 100, description: 'Percentage of targeted traffic included (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  trafficAllocationPercentage?: number = 100;

  @ApiProperty({ example: 'customer.booking.confirmed' })
  @IsString()
  @IsNotEmpty()
  primaryMetricKey!: string;

  @ApiProperty({ type: [ExperimentVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperimentVariantDto)
  variants!: ExperimentVariantDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateExperimentStatusDto {
  @ApiProperty({ enum: ExperimentStatus })
  @IsEnum(ExperimentStatus)
  status!: ExperimentStatus;

  @ApiPropertyOptional({ description: 'The variant key declared as the rollout winner' })
  @IsOptional()
  @IsString()
  winningVariantKey?: string;
}

export class AssignExperimentVariantDto {
  @ApiProperty({ example: 'exp_checkout_one_click_v1' })
  @IsString()
  @IsNotEmpty()
  experimentKey!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anonymousId?: string;
}
