import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class BookingItemResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Booking item UUID' })
  id!: string;

  @ApiProperty({ example: 'Dry Cleaning Service', description: 'Snapshotted service name' })
  serviceName!: string;

  @ApiPropertyOptional({ example: '2-Piece Suit', description: 'Snapshotted variant name', nullable: true })
  variantName!: string | null;

  @ApiProperty({ example: 499.0, description: 'Snapshotted unit price' })
  unitPrice!: number;

  @ApiProperty({ example: 2, description: 'Item quantity' })
  quantity!: number;

  @ApiProperty({ example: 998.0, description: 'Line total amount' })
  totalAmount!: number;
}

export class BookingAddressResponseDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  recipientName!: string;

  @ApiProperty({ example: '+919876543210' })
  recipientPhone!: string;

  @ApiProperty({ example: 'Flat 402, Skyline Towers' })
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'MG Road', nullable: true })
  addressLine2!: string | null;

  @ApiProperty({ example: 'Indiranagar' })
  area!: string;

  @ApiProperty({ example: 'Bangalore' })
  city!: string;

  @ApiProperty({ example: 'Karnataka' })
  state!: string;

  @ApiProperty({ example: '560038' })
  postalCode!: string;

  @ApiPropertyOptional({ example: 'Near Metro Pillar 120', nullable: true })
  landmark!: string | null;

  @ApiPropertyOptional({ example: 12.9716, nullable: true })
  latitude!: number | null;

  @ApiPropertyOptional({ example: 77.5946, nullable: true })
  longitude!: number | null;
}

export class ProviderBookingAddressResponseDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  recipientName!: string;

  @ApiProperty({ example: 'Flat 402, Skyline Towers' })
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'MG Road', nullable: true })
  addressLine2!: string | null;

  @ApiProperty({ example: 'Indiranagar' })
  area!: string;

  @ApiProperty({ example: 'Bangalore' })
  city!: string;

  @ApiProperty({ example: 'Karnataka' })
  state!: string;

  @ApiProperty({ example: '560038' })
  postalCode!: string;

  @ApiPropertyOptional({ example: 'Near Metro Pillar 120', nullable: true })
  landmark!: string | null;
}

export class BookingScheduleResponseDto {
  @ApiProperty({ example: '2026-09-20' })
  pickupDate!: string;

  @ApiProperty({ example: '08:00 AM – 10:00 AM' })
  pickupTimeSlot!: string;

  @ApiPropertyOptional({ example: '2026-09-22', nullable: true })
  returnDate!: string | null;

  @ApiPropertyOptional({ example: '04:00 PM – 06:00 PM', nullable: true })
  returnTimeSlot!: string | null;

  @ApiPropertyOptional({ example: 'Please call before arrival', nullable: true })
  specialInstructions!: string | null;
}

export class BookingStatusHistoryResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiPropertyOptional({ enum: BookingStatus, nullable: true })
  fromStatus!: BookingStatus | null;

  @ApiProperty({ enum: BookingStatus })
  toStatus!: BookingStatus;

  @ApiPropertyOptional({ example: 'Customer rescheduled appointment', nullable: true })
  reason!: string | null;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  createdAt!: Date;
}

export class BookingNoteResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'Customer requested organic detergent' })
  note!: string;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  createdAt!: Date;
}

export class CustomerBookingListItemResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status!: BookingStatus;

  @ApiProperty({ example: 499.0 })
  subtotal!: number;

  @ApiProperty({ example: 499.0 })
  totalAmount!: number;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: '2026-09-20T08:00:00.000Z' })
  scheduledAt!: Date;

  @ApiProperty({ example: 2 })
  itemsCount!: number;

  @ApiProperty({ example: 'Standard Wash & Fold' })
  primaryServiceName!: string;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  createdAt!: Date;
}

export class CustomerBookingDetailResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status!: BookingStatus;

  @ApiProperty({ example: 499.0 })
  subtotal!: number;

  @ApiProperty({ example: 0.0 })
  serviceFee!: number;

  @ApiProperty({ example: 0.0 })
  taxAmount!: number;

  @ApiProperty({ example: 499.0 })
  totalAmount!: number;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: '2026-09-20T08:00:00.000Z' })
  scheduledAt!: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  completedAt!: Date | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  cancelledAt!: Date | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  cancellationReason!: string | null;

  @ApiProperty({ type: [BookingItemResponseDto] })
  items!: BookingItemResponseDto[];

  @ApiPropertyOptional({ type: BookingAddressResponseDto, nullable: true })
  address!: BookingAddressResponseDto | null;

  @ApiPropertyOptional({ type: BookingScheduleResponseDto, nullable: true })
  schedule!: BookingScheduleResponseDto | null;

  @ApiProperty({ type: [BookingStatusHistoryResponseDto] })
  statusHistory!: BookingStatusHistoryResponseDto[];

  @ApiProperty({ type: [BookingNoteResponseDto] })
  notes!: BookingNoteResponseDto[];

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  updatedAt!: Date;
}

export class ProviderBookingListItemResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status!: BookingStatus;

  @ApiProperty({ example: 499.0 })
  totalAmount!: number;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: '2026-09-20T08:00:00.000Z' })
  scheduledAt!: Date;

  @ApiProperty({ example: 2 })
  itemsCount!: number;

  @ApiProperty({ example: 'Standard Wash & Fold' })
  primaryServiceName!: string;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  createdAt!: Date;
}

export class ProviderBookingDetailResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status!: BookingStatus;

  @ApiProperty({ example: 499.0 })
  totalAmount!: number;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: '2026-09-20T08:00:00.000Z' })
  scheduledAt!: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  completedAt!: Date | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  cancelledAt!: Date | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  cancellationReason!: string | null;

  @ApiProperty({ type: [BookingItemResponseDto] })
  items!: BookingItemResponseDto[];

  @ApiPropertyOptional({ type: ProviderBookingAddressResponseDto, nullable: true })
  address!: ProviderBookingAddressResponseDto | null;

  @ApiPropertyOptional({ type: BookingScheduleResponseDto, nullable: true })
  schedule!: BookingScheduleResponseDto | null;

  @ApiProperty({ type: [BookingStatusHistoryResponseDto] })
  statusHistory!: BookingStatusHistoryResponseDto[];

  @ApiProperty({ type: [BookingNoteResponseDto] })
  notes!: BookingNoteResponseDto[];

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  updatedAt!: Date;
}
