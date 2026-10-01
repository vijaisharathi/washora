import { ApiProperty } from '@nestjs/swagger';
import { MemberStatus, OrganizationType, RoleType } from '@prisma/client';

export class CurrentOrganizationDetailsDto {
  @ApiProperty({ example: 'org_0001_uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'ORG-0001' })
  publicId!: string;

  @ApiProperty({ example: 'LuxeCare Hub Chennai' })
  name!: string;

  @ApiProperty({ enum: OrganizationType, example: 'WASHORA' })
  type!: OrganizationType;
}

export class CurrentMembershipDetailsDto {
  @ApiProperty({ example: 'mem_0001_uuid' })
  membershipId!: string;

  @ApiProperty({ example: 'John Doe' })
  fullName!: string;

  @ApiProperty({ enum: RoleType, example: 'ADMIN' })
  role!: RoleType;

  @ApiProperty({ enum: MemberStatus, example: 'ACTIVE' })
  status!: MemberStatus;
}

export class OrganizationContextResponseDto {
  @ApiProperty({ type: CurrentOrganizationDetailsDto })
  organization!: CurrentOrganizationDetailsDto;

  @ApiProperty({ type: CurrentMembershipDetailsDto })
  membership!: CurrentMembershipDetailsDto;

  @ApiProperty({ enum: RoleType, example: 'ADMIN' })
  role!: RoleType;

  @ApiProperty({
    example: ['customer.read', 'customer.update', 'booking.read'],
    type: [String],
  })
  permissions!: string[];
}
