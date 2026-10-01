import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { EarningStatus } from '../types/financial.types';

export class EarningListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by earning status',
    enum: EarningStatus,
  })
  @IsOptional()
  @IsEnum(EarningStatus)
  status?: EarningStatus;

  @ApiPropertyOptional({
    description: 'Filter by provider UUID or public ID (Operations only)',
  })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by delivery partner UUID or public ID (Operations only)',
  })
  @IsOptional()
  @IsString()
  deliveryPartnerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by booking UUID or public ID',
  })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({
    description: 'Filter earnings created on or after ISO date',
    example: '2026-09-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter earnings created on or before ISO date',
    example: '2026-09-30T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
