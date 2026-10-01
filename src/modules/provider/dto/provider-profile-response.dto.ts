import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderApprovalStatus, ProviderStatus } from '@prisma/client';

export class ProviderProfileResponseDto {
  @ApiProperty({ example: 'PRO-0001', description: 'Provider public identifier' })
  id!: string;

  @ApiProperty({ example: 'Rajesh Kumar', description: 'Primary contact name' })
  fullName!: string;

  @ApiPropertyOptional({ example: 'Sparkle Care Laundry Studios', description: 'Registered business name', nullable: true })
  businessName!: string | null;

  @ApiProperty({ example: 'rajesh@example.com', description: 'Email address' })
  email!: string;

  @ApiProperty({ example: '+919876543210', description: 'Business phone number' })
  phone!: string;

  @ApiPropertyOptional({ example: 'Specialized organic dry cleaning', description: 'Provider description', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'Chennai', description: 'City' })
  city!: string;

  @ApiPropertyOptional({ example: '142, GST Road, Guindy', description: 'Workshop street address', nullable: true })
  address!: string | null;

  @ApiPropertyOptional({
    example: 'https://images.washora.com/providers/logo-01.jpg',
    description: 'Logo / Profile image URL',
    nullable: true,
  })
  profileImageUrl!: string | null;

  @ApiPropertyOptional({
    example: 'https://images.washora.com/providers/cover-01.jpg',
    description: 'Cover photo URL',
    nullable: true,
  })
  coverImageUrl!: string | null;

  @ApiProperty({ enum: ProviderStatus, example: ProviderStatus.ACTIVE, description: 'Operational account status' })
  status!: ProviderStatus;

  @ApiProperty({ enum: ProviderApprovalStatus, example: ProviderApprovalStatus.APPROVED, description: 'KYC approval status' })
  approvalStatus!: ProviderApprovalStatus;

  @ApiProperty({ example: 4.85, description: 'Average rating' })
  rating!: number;

  @ApiProperty({ example: 42, description: 'Total verified customer reviews' })
  totalReviews!: number;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Registration timestamp' })
  joinedAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'Last update timestamp' })
  updatedAt!: Date;
}
