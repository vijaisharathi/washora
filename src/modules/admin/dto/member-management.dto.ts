import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus, RoleType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Member full name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ description: 'Initial role in organization', enum: RoleType })
  @IsEnum(RoleType)
  @IsNotEmpty()
  role!: RoleType;

  @ApiPropertyOptional({ description: 'Member direct phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Work area or hub', default: 'PLATFORM' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  primaryWorkArea?: string;

  @ApiPropertyOptional({ description: 'Preferred communication language', default: 'ENGLISH' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  preferredLanguage?: string;
}

export class UpdateMemberDto {
  @ApiPropertyOptional({ description: 'Member full name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Member direct phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ description: 'Member status', enum: MemberStatus })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ description: 'Work area or hub' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  primaryWorkArea?: string;

  @ApiPropertyOptional({ description: 'Preferred communication language' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  preferredLanguage?: string;
}

export class UpdateMemberRolesDto {
  @ApiProperty({ description: 'New role assignment for organization member', enum: RoleType })
  @IsEnum(RoleType)
  @IsNotEmpty()
  role!: RoleType;
}

export class MemberQueryDto {
  @ApiPropertyOptional({ description: 'Filter by membership status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by role', enum: RoleType })
  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @ApiPropertyOptional({ description: 'Search term for name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit per page', default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
