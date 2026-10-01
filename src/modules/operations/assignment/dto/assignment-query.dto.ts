import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentStatus, AssignmentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';

export class OperationsAssignmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter assignments by type',
    enum: AssignmentType,
  })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiPropertyOptional({
    description: 'Filter assignments by status',
    enum: AssignmentStatus,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by provider identifier (UUID or PRO-xxxx)',
    example: 'PRO-0001',
  })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by delivery partner identifier (UUID or DLP-xxxx)',
    example: 'DLP-0001',
  })
  @IsOptional()
  @IsString()
  deliveryPartnerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by booking identifier (UUID or WAS-YYYY-xxxxxx)',
    example: 'WAS-2026-000001',
  })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({
    description: 'Filter assignments created/scheduled on or after date (YYYY-MM-DD)',
    example: '2026-09-01',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter assignments created/scheduled on or before date (YYYY-MM-DD)',
    example: '2026-09-30',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class ProviderAssignmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter assignments by status',
    enum: AssignmentStatus,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({
    description: 'Filter assignments created on or after date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter assignments created on or before date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class DeliveryPartnerAssignmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter assignments by status',
    enum: AssignmentStatus,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({
    description: 'Filter assignments created on or after date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter assignments created on or before date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
