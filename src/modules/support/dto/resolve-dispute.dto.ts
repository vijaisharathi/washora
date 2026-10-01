import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  RESOLUTION_TYPES,
  type DisputeResolutionType,
} from '../types/support.types';

export class ResolveDisputeDto {
  @ApiProperty({
    enum: RESOLUTION_TYPES,
    example: 'PARTIAL_REFUND',
    description: 'Outcome resolution type',
  })
  @IsString()
  @IsIn(RESOLUTION_TYPES as unknown as string[])
  resolutionType!: string;

  @ApiProperty({
    example: 'Approved partial refund after evidence review.',
    description: 'Detailed resolution findings and note (3-2000 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(2000)
  resolutionNote!: string;

  @ApiPropertyOptional({
    example: '500.00',
    description: 'Financial resolution amount (required for PARTIAL_REFUND, optional for FULL_REFUND)',
  })
  @IsOptional()
  @IsNumberString()
  amount?: string;
}
