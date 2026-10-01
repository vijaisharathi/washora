import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateDeliveryAvailabilityDto {
  @ApiProperty({
    description: 'Day of week index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({
    description: 'Daily shift start time in 24-hour HH:mm format',
    example: '08:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in 24-hour HH:mm format (e.g. 08:00, 13:30)',
  })
  startTime!: string;

  @ApiProperty({
    description: 'Daily shift end time in 24-hour HH:mm format',
    example: '20:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in 24-hour HH:mm format (e.g. 17:00, 22:00)',
  })
  endTime!: string;

  @ApiPropertyOptional({
    description: 'Whether delivery partner is active for orders on this day',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateDeliveryAvailabilityDto {
  @ApiPropertyOptional({
    description: 'Daily shift start time in 24-hour HH:mm format',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in 24-hour HH:mm format',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Daily shift end time in 24-hour HH:mm format',
    example: '19:00',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in 24-hour HH:mm format',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Whether delivery partner is available for assignments on this day',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
