import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsInt({ message: 'Day of week must be an integer between 0 and 6' })
  @Min(0, { message: 'Day of week must be at least 0 (Sunday)' })
  @Max(6, { message: 'Day of week must be at most 6 (Saturday)' })
  dayOfWeek!: number;

  @ApiProperty({
    description: 'Opening / start time in 24-hour HH:mm format',
    example: '08:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be a valid 24-hour time string in HH:mm format',
  })
  startTime!: string;

  @ApiProperty({
    description: 'Closing / end time in 24-hour HH:mm format',
    example: '20:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be a valid 24-hour time string in HH:mm format',
  })
  endTime!: string;

  @ApiPropertyOptional({
    description: 'Whether provider is accepting bookings on this day',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;

  @ApiPropertyOptional({
    description: 'Maximum order capacity for this day',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Max daily orders must be at least 1' })
  maxDailyOrders?: number = 30;
}

export class UpdateAvailabilityDto {
  @ApiPropertyOptional({
    description: 'Opening / start time in 24-hour HH:mm format',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be a valid 24-hour time string in HH:mm format',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Closing / end time in 24-hour HH:mm format',
    example: '21:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be a valid 24-hour time string in HH:mm format',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Whether provider is accepting bookings on this day',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum order capacity for this day',
    example: 35,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Max daily orders must be at least 1' })
  maxDailyOrders?: number;
}
