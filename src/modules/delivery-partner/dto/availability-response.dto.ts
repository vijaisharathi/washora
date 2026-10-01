import { ApiProperty } from '@nestjs/swagger';

export class DeliveryPartnerAvailabilityResponseDto {
  @ApiProperty({
    description: 'Unique internal identifier of the availability record',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  id!: string;

  @ApiProperty({
    description: 'Public identifier of the delivery partner',
    example: 'DLP-0001',
  })
  deliveryPartnerId!: string;

  @ApiProperty({
    description: 'Day of week index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)',
    example: 1,
  })
  dayOfWeek!: number;

  @ApiProperty({
    description: 'Human-readable day name',
    example: 'Monday',
  })
  dayName!: string;

  @ApiProperty({
    description: 'Shift start time (24h HH:mm)',
    example: '08:00',
  })
  startTime!: string;

  @ApiProperty({
    description: 'Shift end time (24h HH:mm)',
    example: '20:00',
  })
  endTime!: string;

  @ApiProperty({
    description: 'Availability status for the day',
    example: true,
  })
  isAvailable!: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-02-01T09:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-02-01T09:00:00.000Z',
  })
  updatedAt!: Date;
}
