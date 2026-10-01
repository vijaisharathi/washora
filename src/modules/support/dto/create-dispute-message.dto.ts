import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDisputeMessageDto {
  @ApiProperty({
    example: 'I have attached photos of the affected clothes before and after pickup.',
    description: 'Dispute message content (1-5000 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Internal operations/investigation note flag (operations only)',
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean = false;
}
