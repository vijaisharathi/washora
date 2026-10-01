import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DeliveryPartnerApprovalStatus,
  DeliveryPartnerStatus,
  VehicleType,
} from '@prisma/client';

export class DeliveryPartnerProfileResponseDto {
  @ApiProperty({
    description: 'Public business identifier of the delivery partner',
    example: 'DLP-0001',
  })
  id!: string;

  @ApiProperty({
    description: 'Full name of the delivery partner',
    example: 'Rajesh Kumar',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Email address of delivery partner account',
    example: 'rajesh.kumar@washora.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+919876543210',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Profile avatar URL',
    example: 'https://images.washora.com/avatars/dlp-rajesh.jpg',
  })
  profileImageUrl?: string | null;

  @ApiProperty({
    description: 'Vehicle type',
    enum: VehicleType,
    example: VehicleType.BIKE,
  })
  vehicleType!: VehicleType;

  @ApiPropertyOptional({
    description: 'Vehicle registration license plate number',
    example: 'TN01AB1234',
  })
  vehicleNumber?: string | null;

  @ApiProperty({
    description: 'Primary operating city',
    example: 'Chennai',
  })
  city!: string;

  @ApiProperty({
    description: 'Lifecycle account status',
    enum: DeliveryPartnerStatus,
    example: DeliveryPartnerStatus.ACTIVE,
  })
  status!: DeliveryPartnerStatus;

  @ApiProperty({
    description: 'Onboarding compliance approval status',
    enum: DeliveryPartnerApprovalStatus,
    example: DeliveryPartnerApprovalStatus.APPROVED,
  })
  approvalStatus!: DeliveryPartnerApprovalStatus;

  @ApiProperty({
    description: 'Aggregate customer rating',
    example: 4.85,
  })
  rating!: number;

  @ApiProperty({
    description: 'Total completed delivery runs',
    example: 124,
  })
  totalDeliveries!: number;

  @ApiProperty({
    description: 'Number of successfully completed deliveries',
    example: 120,
  })
  completedDeliveries!: number;

  @ApiProperty({
    description: 'Total partner earnings in base currency',
    example: 18500.5,
  })
  totalEarnings!: number;

  @ApiPropertyOptional({
    description: 'Timestamp of last activity/ping',
    example: '2026-09-11T08:30:00.000Z',
  })
  lastActiveAt?: Date | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2026-01-15T10:00:00.000Z',
  })
  joinedAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-09-11T12:00:00.000Z',
  })
  updatedAt!: Date;
}
