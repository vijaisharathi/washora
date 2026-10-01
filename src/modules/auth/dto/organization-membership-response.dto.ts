import { ApiProperty } from '@nestjs/swagger';
import { MemberStatus, OrganizationType, RoleType } from '@prisma/client';

export class OrganizationMembershipResponseDto {
  @ApiProperty({ example: 'org_0001_uuid' })
  id!: string;

  @ApiProperty({ example: 'ORG-0001' })
  publicId!: string;

  @ApiProperty({ example: 'LuxeCare Hub Chennai' })
  name!: string;

  @ApiProperty({ enum: OrganizationType, example: 'WASHORA' })
  type!: OrganizationType;

  @ApiProperty({ example: 'mem_0001_uuid' })
  membershipId!: string;

  @ApiProperty({ enum: RoleType, example: 'ADMIN' })
  role!: RoleType;

  @ApiProperty({ enum: MemberStatus, example: 'ACTIVE' })
  membershipStatus!: MemberStatus;
}
