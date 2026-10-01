import { ApiProperty } from '@nestjs/swagger';

export class ProviderServiceAreaResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Service area UUID' })
  id!: string;

  @ApiProperty({ example: 'PRO-0001', description: 'Provider public ID' })
  providerId!: string;

  @ApiProperty({ example: 'Guindy Industrial Area', description: 'Locality or area name' })
  areaName!: string;

  @ApiProperty({ example: '600032', description: '6-digit Indian PIN code' })
  postalCode!: string;

  @ApiProperty({ example: 'Chennai', description: 'City' })
  city!: string;

  @ApiProperty({ example: true, description: 'Whether active for delivery and pickup' })
  isActive!: boolean;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Created timestamp' })
  createdAt!: Date;
}
