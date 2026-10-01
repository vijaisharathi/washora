import { ApiProperty } from '@nestjs/swagger';

export class DeliveryPartnerServiceAreaResponseDto {
  @ApiProperty({
    description: 'Unique internal identifier of the service area record',
    example: 'd9b02a28-98e3-4f91-8be7-3479528d22df',
  })
  id!: string;

  @ApiProperty({
    description: 'Public identifier of the delivery partner',
    example: 'DLP-0001',
  })
  deliveryPartnerId!: string;

  @ApiProperty({
    description: 'Area or locality description',
    example: 'Adyar & Besant Nagar',
  })
  areaName!: string;

  @ApiProperty({
    description: '6-digit postal code (PIN code)',
    example: '600020',
  })
  postalCode!: string;

  @ApiProperty({
    description: 'Operating city',
    example: 'Chennai',
  })
  city!: string;

  @ApiProperty({
    description: 'Active status of the service area',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-02-01T09:00:00.000Z',
  })
  createdAt!: Date;
}
