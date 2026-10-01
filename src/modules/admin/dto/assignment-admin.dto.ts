import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignmentAdminQueryDto {
  @ApiPropertyOptional({ description: 'Filter by booking ID' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({ description: 'Filter by provider ID' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Filter by delivery partner ID' })
  @IsOptional()
  @IsString()
  deliveryPartnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by assignment status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by assignment type', enum: AssignmentType })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

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

export class AdminReassignDto {
  @ApiPropertyOptional({ description: 'New Provider ID' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ description: 'New Delivery Partner ID' })
  @IsOptional()
  @IsString()
  deliveryPartnerId?: string;

  @ApiPropertyOptional({ description: 'New assignee entity ID (Provider or DeliveryPartner ID)' })
  @IsOptional()
  @IsString()
  newAssigneeId?: string;

  @ApiPropertyOptional({ description: 'Role of assignee: PROVIDER or DELIVERY_PARTNER', enum: AssignmentType })
  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @ApiProperty({ description: 'Reason for reassignment' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class AdminCancelAssignmentDto {
  @ApiProperty({ description: 'Operational cancellation reason' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
