import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressLabel, AddressStatus } from '@prisma/client';

export class CustomerAddressResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Address UUID' })
  id!: string;

  @ApiProperty({ example: 'CUS-0001', description: 'Customer public identifier' })
  customerId!: string;

  @ApiProperty({ enum: AddressLabel, example: AddressLabel.HOME, description: 'Address label' })
  label!: AddressLabel;

  @ApiProperty({ example: 'John Doe', description: 'Recipient full name' })
  recipientName!: string;

  @ApiProperty({ example: '+919876543210', description: 'Recipient contact phone' })
  recipientPhone!: string;

  @ApiProperty({ example: '12 Example Street', description: 'Street address' })
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'Apartment 4B', description: 'Unit / Suite / Floor', nullable: true })
  addressLine2!: string | null;

  @ApiProperty({ example: 'Anna Nagar', description: 'Area / Neighborhood' })
  area!: string;

  @ApiProperty({ example: 'Chennai', description: 'City' })
  city!: string;

  @ApiProperty({ example: 'Tamil Nadu', description: 'State' })
  state!: string;

  @ApiProperty({ example: '600040', description: 'Postal code' })
  postalCode!: string;

  @ApiPropertyOptional({ example: 'Near Metro Station', description: 'Nearby landmark', nullable: true })
  landmark!: string | null;

  @ApiPropertyOptional({ example: 13.085, description: 'Latitude', nullable: true })
  latitude!: number | null;

  @ApiPropertyOptional({ example: 80.21, description: 'Longitude', nullable: true })
  longitude!: number | null;

  @ApiProperty({ example: true, description: 'Whether this is the default address' })
  isDefault!: boolean;

  @ApiProperty({ enum: AddressStatus, example: AddressStatus.ACTIVE, description: 'Address status' })
  status!: AddressStatus;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'Last update timestamp' })
  updatedAt!: Date;
}
