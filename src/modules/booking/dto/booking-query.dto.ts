import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class BookingQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter bookings by status',
    enum: BookingStatus,
    example: BookingStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: 'Filter bookings scheduled on or after this date (YYYY-MM-DD)',
    example: '2026-09-01',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter bookings scheduled on or before this date (YYYY-MM-DD)',
    example: '2026-09-30',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Search by booking public ID or service name',
    example: 'WAS-2026',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
