import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RescheduleBookingDto {
  @ApiProperty({
    description: 'New pickup scheduled date (YYYY-MM-DD)',
    example: '2026-09-23',
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'pickupDate must be in YYYY-MM-DD format',
  })
  pickupDate!: string;

  @ApiProperty({
    description: 'New pickup time slot window',
    example: '01:00 PM – 03:00 PM',
  })
  @IsNotEmpty()
  @IsString()
  pickupTimeSlot!: string;

  @ApiPropertyOptional({
    description: 'Optional new estimated return delivery date (YYYY-MM-DD)',
    example: '2026-09-25',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'returnDate must be in YYYY-MM-DD format',
  })
  returnDate?: string;

  @ApiPropertyOptional({
    description: 'Optional new estimated return delivery time slot',
    example: '04:00 PM – 06:00 PM',
  })
  @IsOptional()
  @IsString()
  returnTimeSlot?: string;

  @ApiPropertyOptional({
    description: 'Optional reason for rescheduling',
    example: 'Postponed due to office meeting',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
