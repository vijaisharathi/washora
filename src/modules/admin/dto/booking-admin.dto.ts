import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BookingAdminQueryDto {
  @ApiPropertyOptional({ description: 'Filter by booking UUID or public booking number' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Filter by provider ID' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Filter by delivery partner ID' })
  @IsOptional()
  @IsString()
  deliveryPartnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by catalog service ID' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ description: 'Filter by booking status', enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Filter by payment status' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Search term for booking number or customer/provider name' })
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

export class AdminCancelBookingDto {
  @ApiProperty({ description: 'Operational cancellation rationale' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class AdminRescheduleBookingDto {
  @ApiPropertyOptional({ description: 'New pickup date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  pickupDate?: string;

  @ApiPropertyOptional({ description: 'New pickup time slot' })
  @IsOptional()
  @IsString()
  pickupTimeSlot?: string;

  @ApiPropertyOptional({ description: 'New scheduled date (YYYY-MM-DD or ISO)' })
  @IsOptional()
  @IsString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'New time slot' })
  @IsOptional()
  @IsString()
  timeSlot?: string;

  @ApiPropertyOptional({ description: 'New return date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  returnDate?: string;

  @ApiPropertyOptional({ description: 'New return time slot' })
  @IsOptional()
  @IsString()
  returnTimeSlot?: string;

  @ApiPropertyOptional({ description: 'Operational reason for rescheduling' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminCreateBookingNoteDto {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  note!: string;

  @ApiPropertyOptional({ description: 'Whether note is internal to operations only', default: true })
  @IsOptional()
  @IsBoolean()
  isInternalOnly?: boolean = true;
}
