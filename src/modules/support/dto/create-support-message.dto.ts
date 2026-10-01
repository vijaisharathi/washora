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

export class CreateSupportMessageDto {
  @ApiProperty({
    example: 'Thank you for updating. I have provided the necessary booking access details.',
    description: 'Message content (1-5000 characters)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;

  @ApiPropertyOptional({
    default: false,
    description: 'If true, message is marked as internal for operations only',
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean = false;
}
