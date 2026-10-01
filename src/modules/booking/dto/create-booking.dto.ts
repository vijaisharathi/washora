import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingItemInputDto {
  @ApiProperty({
    description: 'Catalog service identifier (UUID or publicId)',
    example: 'SVC-0001',
  })
  @IsNotEmpty()
  @IsString()
  serviceId!: string;

  @ApiPropertyOptional({
    description: 'Service variant identifier (UUID or publicId)',
    example: 'VAR-0001',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({
    description: 'Quantity of service units (1-20)',
    example: 2,
    minimum: 1,
    maximum: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;
}

export class CreateBookingDto {
  @ApiProperty({
    description: 'List of booking items (minimum 1 item)',
    type: [BookingItemInputDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingItemInputDto)
  items!: BookingItemInputDto[];

  @ApiProperty({
    description: 'Saved customer address identifier (UUID or publicId)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  @IsString()
  addressId!: string;

  @ApiProperty({
    description: 'Pickup scheduled date (YYYY-MM-DD)',
    example: '2026-09-20',
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'pickupDate must be in YYYY-MM-DD format',
  })
  pickupDate!: string;

  @ApiProperty({
    description: 'Pickup time slot window',
    example: '08:00 AM – 10:00 AM',
  })
  @IsNotEmpty()
  @IsString()
  pickupTimeSlot!: string;

  @ApiPropertyOptional({
    description: 'Optional estimated return delivery date (YYYY-MM-DD)',
    example: '2026-09-22',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'returnDate must be in YYYY-MM-DD format',
  })
  returnDate?: string;

  @ApiPropertyOptional({
    description: 'Optional estimated return delivery time slot',
    example: '04:00 PM – 06:00 PM',
  })
  @IsOptional()
  @IsString()
  returnTimeSlot?: string;

  @ApiPropertyOptional({
    description: 'Special handling instructions for laundry valet',
    example: 'Please ring bell and leave with security if unavailable',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  specialInstructions?: string;

  @ApiPropertyOptional({
    description: 'Optional selected Provider identifier (UUID or publicId)',
    example: 'PRO-0001',
  })
  @IsOptional()
  @IsString()
  providerId?: string;
}
