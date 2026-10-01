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

export class CreateDisputeFromTicketDto {
  @ApiProperty({
    enum: DisputeType,
    example: DisputeType.SERVICE_QUALITY,
    description: 'Dispute category or type',
  })
  @IsEnum(DisputeType)
  type!: DisputeType;

  @ApiProperty({
    example: 'Garment damaged during dry cleaning cycle',
    description: 'Core reason for dispute (3-255 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  reason!: string;

  @ApiPropertyOptional({
    example: 'Customer provided photos showing shrinkage and tearing on silk shirt.',
    description: 'Dispute description (if different from ticket description)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    example: '750.00',
    description: 'Claimed dispute amount if financial claim is made',
  })
  @IsOptional()
  @IsNumberString()
  claimAmount?: string;
}
