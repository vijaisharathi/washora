import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipTier, UserStatus } from '@prisma/client';

export class CustomerProfileResponseDto {
  @ApiProperty({ example: 'CUS-0001', description: 'Customer public identifier' })
  id!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  fullName!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email!: string;

  @ApiProperty({ example: '+919876543210', description: 'Mobile phone number' })
  phone!: string;

  @ApiPropertyOptional({
    example: 'https://images.washora.com/profiles/cus-01.jpg',
    description: 'Profile avatar image URL',
    nullable: true,
  })
  profileImageUrl!: string | null;

  @ApiProperty({ enum: MembershipTier, example: MembershipTier.STANDARD, description: 'Membership tier' })
  membershipTier!: MembershipTier;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'Customer status' })
  status!: UserStatus;

  @ApiProperty({ example: '2026-09-10T10:00:00.000Z', description: 'Date customer joined' })
  joinedAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'Last update timestamp' })
  updatedAt!: Date;
}
