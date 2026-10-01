import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class AuthUserResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  phone?: string | null;

  @ApiProperty({ enum: UserStatus, example: 'ACTIVE' })
  status!: UserStatus;

  @ApiPropertyOptional({ example: '2026-09-11T04:00:00.000Z' })
  emailVerifiedAt?: Date | null;

  @ApiPropertyOptional({ example: '2026-09-11T04:00:00.000Z' })
  phoneVerifiedAt?: Date | null;

  @ApiPropertyOptional({ example: '2026-09-11T04:00:00.000Z' })
  lastLoginAt?: Date | null;

  @ApiProperty({ example: '2026-09-11T04:00:00.000Z' })
  createdAt!: Date;
}

export class LoginResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ example: 900, description: 'Access token expiration in seconds' })
  expiresIn!: number;
}

export class RefreshResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ example: 900, description: 'Access token expiration in seconds' })
  expiresIn!: number;
}

export class SessionResponseDto {
  @ApiProperty({ example: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  id!: string;

  @ApiProperty({ example: '2026-09-11T04:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ example: '2026-09-11T04:30:00.000Z' })
  lastUsedAt?: Date | null;

  @ApiProperty({ example: '2026-10-11T04:00:00.000Z' })
  expiresAt!: Date;

  @ApiPropertyOptional({ example: '127.0.0.1' })
  ipAddress?: string | null;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  userAgent?: string | null;

  @ApiProperty({ example: true, description: 'True if this is the current active session' })
  current!: boolean;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully.' })
  message!: string;
}
