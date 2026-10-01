import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DisputeType } from '../types/support.types';

export class CreateDisputeDto {
  @ApiProperty({
    example: 'WAS-2026-000001',
    description: 'Booking public number or UUID to dispute',
  })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({
    enum: DisputeType,
    example: DisputeType.SERVICE_QUALITY,
    description: 'Category / type of the dispute',
  })
  @IsEnum(DisputeType)
  category!: DisputeType;

  @ApiProperty({
    example: 'The requested service was not completed properly.',
    description: 'Reason for raising dispute (3-255 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  reason!: string;

  @ApiPropertyOptional({
    example: 'Stains remain on three shirts after dry cleaning was completed.',
    description: 'Detailed description of the dispute (5-5000 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    example: '500.00',
    description: 'Claimed financial dispute amount',
  })
  @IsOptional()
  @IsNumberString()
  amount?: string;

  @ApiPropertyOptional({
    example: 'INR',
    default: 'INR',
    description: 'Currency code',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string = 'INR';
}
