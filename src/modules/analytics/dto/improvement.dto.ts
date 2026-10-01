import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum ImprovementCategory {
  UX = 'UX',
  PERFORMANCE = 'PERFORMANCE',
  CONVERSION = 'CONVERSION',
  OPERATIONS = 'OPERATIONS',
  FINANCIAL = 'FINANCIAL',
}

export enum ImprovementPriority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
}

export enum ImprovementStatus {
  IDEA = 'IDEA',
  BACKLOG = 'BACKLOG',
  PLANNED = 'PLANNED',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  VALIDATING = 'VALIDATING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class CreateImprovementDto {
  @ApiProperty({ example: 'Streamline Slot Selection on Mobile' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @ApiProperty({ example: 'Reduce date/time picker interaction friction on smaller viewports' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ImprovementCategory })
  @IsEnum(ImprovementCategory)
  category!: ImprovementCategory;

  @ApiProperty({ enum: ImprovementPriority, default: ImprovementPriority.P2 })
  @IsEnum(ImprovementPriority)
  priority!: ImprovementPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceExperimentId?: string;

  @ApiPropertyOptional({ example: '+4.5% lift in booking initiation to schedule step' })
  @IsOptional()
  @IsString()
  hypothesizedImpact?: string;
}

export class UpdateImprovementDto {
  @ApiPropertyOptional({ enum: ImprovementStatus })
  @IsOptional()
  @IsEnum(ImprovementStatus)
  status?: ImprovementStatus;

  @ApiPropertyOptional({ enum: ImprovementPriority })
  @IsOptional()
  @IsEnum(ImprovementPriority)
  priority?: ImprovementPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @ApiPropertyOptional({ example: 4.8 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  actualMetricLift?: number;
}
