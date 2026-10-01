import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SupportCategory, SupportPriority } from '../types/support.types';

export class CreateSupportTicketDto {
  @ApiProperty({
    enum: SupportCategory,
    example: SupportCategory.BOOKING,
    description: 'Category of the support request',
  })
  @IsEnum(SupportCategory)
  category!: SupportCategory;

  @ApiProperty({
    example: 'Issue with booking schedule',
    description: 'Subject of the ticket (3-200 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @ApiProperty({
    example: 'The requested service was not started on time and the valet was unresponsive.',
    description: 'Detailed description of the issue (5-5000 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({
    example: 'WAS-2026-000001',
    description: 'Referenced booking number or UUID if applicable',
  })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({
    example: 'PAY-2026-000001',
    description: 'Referenced payment public ID or UUID if applicable',
  })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiPropertyOptional({
    enum: SupportPriority,
    default: SupportPriority.MEDIUM,
    description: 'Initial priority (Operations can set, user default is MEDIUM)',
  })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;
}
