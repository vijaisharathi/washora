import { ApiProperty } from '@nestjs/swagger';

export class ProviderAvailabilityResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Schedule UUID' })
  id!: string;

  @ApiProperty({ example: 'PRO-0001', description: 'Provider public ID' })
  providerId!: string;

  @ApiProperty({ example: 1, description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)' })
  dayOfWeek!: number;

  @ApiProperty({ example: 'Monday', description: 'Day of week name' })
  dayName!: string;

  @ApiProperty({ example: '08:00', description: 'Opening start time in 24-hour HH:mm format' })
  startTime!: string;

  @ApiProperty({ example: '20:00', description: 'Closing end time in 24-hour HH:mm format' })
  endTime!: string;

  @ApiProperty({ example: true, description: 'Operating availability status' })
  isAvailable!: boolean;

  @ApiProperty({ example: 30, description: 'Maximum daily order capacity' })
  maxDailyOrders!: number;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Created timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'Updated timestamp' })
  updatedAt!: Date;
}
