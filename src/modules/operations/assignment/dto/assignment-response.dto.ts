import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AssignmentAction,
  AssignmentStatus,
  AssignmentType,
  BookingStatus,
  VehicleType,
} from '@prisma/client';

export class AssignmentHistoryResponseDto {
  @ApiProperty({ example: 'b6f001e2-9d32-4e08-bfb8-936eb2ef24f8' })
  id!: string;

  @ApiProperty({ example: 'ASN-2026-000001' })
  assignmentId!: string;

  @ApiProperty({ enum: AssignmentAction, example: AssignmentAction.OFFERED })
  action!: AssignmentAction;

  @ApiPropertyOptional({ example: 'usr-admin-01' })
  actorUserId?: string | null;

  @ApiPropertyOptional({ example: 'Assignment offered to provider' })
  details?: string | null;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  createdAt!: Date;
}

export class AssignmentBookingSummaryDto {
  @ApiProperty({ example: 'a5f001e2-9d32-4e08-bfb8-936eb2ef24f7' })
  id!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status!: BookingStatus;

  @ApiProperty({ example: '2026-09-15T10:00:00.000Z' })
  scheduledAt!: Date;

  @ApiProperty({ example: '499.00' })
  totalAmount!: string;

  @ApiProperty({ example: 'INR' })
  currency!: string;
}

export class AssignmentProviderSummaryDto {
  @ApiProperty({ example: 'c5f001e2-9d32-4e08-bfb8-936eb2ef24f1' })
  id!: string;

  @ApiProperty({ example: 'PRO-0001' })
  publicId!: string;

  @ApiPropertyOptional({ example: 'Sparkle Cleaners' })
  businessName?: string | null;

  @ApiProperty({ example: 'Rajesh Kumar' })
  fullName!: string;

  @ApiProperty({ example: '+919876543210' })
  phone!: string;
}

export class AssignmentDeliveryPartnerSummaryDto {
  @ApiProperty({ example: 'd5f001e2-9d32-4e08-bfb8-936eb2ef24f2' })
  id!: string;

  @ApiProperty({ example: 'DLP-0001' })
  publicId!: string;

  @ApiProperty({ example: 'Karthik Raja' })
  fullName!: string;

  @ApiProperty({ example: '+919876543211' })
  phone!: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.BIKE })
  vehicleType!: VehicleType;
}

export class AssignmentResponseDto {
  @ApiProperty({ example: 'b6f001e2-9d32-4e08-bfb8-936eb2ef24f8' })
  id!: string;

  @ApiProperty({ example: 'ASN-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'a5f001e2-9d32-4e08-bfb8-936eb2ef24f7' })
  bookingId!: string;

  @ApiProperty({ example: 'org-washora-01' })
  organizationId!: string;

  @ApiPropertyOptional({ example: 'c5f001e2-9d32-4e08-bfb8-936eb2ef24f1' })
  providerId?: string | null;

  @ApiPropertyOptional({ example: 'd5f001e2-9d32-4e08-bfb8-936eb2ef24f2' })
  deliveryPartnerId?: string | null;

  @ApiProperty({ enum: AssignmentType, example: AssignmentType.PROVIDER })
  type!: AssignmentType;

  @ApiProperty({ enum: AssignmentStatus, example: AssignmentStatus.ASSIGNED })
  status!: AssignmentStatus;

  @ApiPropertyOptional({ example: 'Express wash requested' })
  notes?: string | null;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  assignedAt!: Date;

  @ApiPropertyOptional({ example: '2026-09-12T10:05:00.000Z' })
  acceptedAt?: Date | null;

  @ApiPropertyOptional()
  completedAt?: Date | null;

  @ApiPropertyOptional()
  cancelledAt?: Date | null;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-12T10:05:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: AssignmentBookingSummaryDto })
  booking?: AssignmentBookingSummaryDto | null;

  @ApiPropertyOptional({ type: AssignmentProviderSummaryDto })
  provider?: AssignmentProviderSummaryDto | null;

  @ApiPropertyOptional({ type: AssignmentDeliveryPartnerSummaryDto })
  deliveryPartner?: AssignmentDeliveryPartnerSummaryDto | null;

  @ApiPropertyOptional({ type: [AssignmentHistoryResponseDto] })
  history?: AssignmentHistoryResponseDto[];
}

export class AssignmentListItemResponseDto {
  @ApiProperty({ example: 'b6f001e2-9d32-4e08-bfb8-936eb2ef24f8' })
  id!: string;

  @ApiProperty({ example: 'ASN-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'a5f001e2-9d32-4e08-bfb8-936eb2ef24f7' })
  bookingId!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiPropertyOptional({ example: 'PRO-0001' })
  providerId?: string | null;

  @ApiPropertyOptional({ example: 'Sparkle Cleaners' })
  providerName?: string | null;

  @ApiPropertyOptional({ example: 'DLP-0001' })
  deliveryPartnerId?: string | null;

  @ApiPropertyOptional({ example: 'Karthik Raja' })
  deliveryPartnerName?: string | null;

  @ApiProperty({ enum: AssignmentType, example: AssignmentType.PROVIDER })
  type!: AssignmentType;

  @ApiProperty({ enum: AssignmentStatus, example: AssignmentStatus.ASSIGNED })
  status!: AssignmentStatus;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  assignedAt!: Date;

  @ApiPropertyOptional()
  acceptedAt?: Date | null;

  @ApiPropertyOptional()
  completedAt?: Date | null;

  @ApiPropertyOptional()
  cancelledAt?: Date | null;
}

// ----------------------------------------------------------------------
// PROVIDER SELF-SERVICE DTOS (PRIVACY REDACTED)
// ----------------------------------------------------------------------

export class ProviderBookingRedactedAddressDto {
  @ApiProperty({ example: 'Anita Sharma' })
  recipientName!: string;

  @ApiProperty({ example: 'No 45, Anna Nagar 2nd Street' })
  addressLine1!: string;

  @ApiPropertyOptional({ example: 'Near Roundtana' })
  addressLine2?: string | null;

  @ApiProperty({ example: 'Anna Nagar' })
  area!: string;

  @ApiProperty({ example: 'Chennai' })
  city!: string;

  @ApiProperty({ example: '600040' })
  postalCode!: string;
}

export class ProviderAssignmentDetailDto {
  @ApiProperty({ example: 'b6f001e2-9d32-4e08-bfb8-936eb2ef24f8' })
  id!: string;

  @ApiProperty({ example: 'ASN-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'a5f001e2-9d32-4e08-bfb8-936eb2ef24f7' })
  bookingId!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: AssignmentType, example: AssignmentType.PROVIDER })
  type!: AssignmentType;

  @ApiProperty({ enum: AssignmentStatus, example: AssignmentStatus.ASSIGNED })
  status!: AssignmentStatus;

  @ApiPropertyOptional({ example: 'Customer requested gentle detergent' })
  notes?: string | null;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  assignedAt!: Date;

  @ApiPropertyOptional({ example: '2026-09-12T10:05:00.000Z' })
  acceptedAt?: Date | null;

  @ApiProperty({
    example: [
      {
        serviceName: 'Premium Dry Clean',
        variantName: 'Silk Saree',
        quantity: 2,
      },
    ],
  })
  items!: Array<{
    serviceName: string;
    variantName?: string | null;
    quantity: number;
  }>;

  @ApiProperty({
    example: {
      pickupDate: '2026-09-15',
      pickupTimeSlot: '10:00 AM - 12:00 PM',
      returnDate: '2026-09-17',
      returnTimeSlot: '04:00 PM - 06:00 PM',
      specialInstructions: 'Handle silk items with care',
    },
  })
  schedule!: {
    pickupDate: string;
    pickupTimeSlot: string;
    returnDate?: string | null;
    returnTimeSlot?: string | null;
    specialInstructions?: string | null;
  };

  @ApiProperty({ type: ProviderBookingRedactedAddressDto })
  address!: ProviderBookingRedactedAddressDto;

  @ApiProperty({ type: [AssignmentHistoryResponseDto] })
  history!: AssignmentHistoryResponseDto[];
}

export class ProviderAssignmentListItemDto {
  @ApiProperty({ example: 'b6f001e2-9d32-4e08-bfb8-936eb2ef24f8' })
  id!: string;

  @ApiProperty({ example: 'ASN-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'a5f001e2-9d32-4e08-bfb8-936eb2ef24f7' })
  bookingId!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: AssignmentStatus, example: AssignmentStatus.ASSIGNED })
  status!: AssignmentStatus;

  @ApiProperty({ example: '2026-09-15T10:00:00.000Z' })
  scheduledAt!: Date;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  assignedAt!: Date;

  @ApiPropertyOptional()
  acceptedAt?: Date | null;

  @ApiProperty({ example: 2 })
  itemsCount!: number;
}

// ----------------------------------------------------------------------
// DELIVERY PARTNER SELF-SERVICE DTOS
// ----------------------------------------------------------------------

export class DeliveryPartnerAssignmentDetailDto {
  @ApiProperty({ example: 'b6f001e2-9d32-4e08-bfb8-936eb2ef24f8' })
  id!: string;

  @ApiProperty({ example: 'ASN-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'a5f001e2-9d32-4e08-bfb8-936eb2ef24f7' })
  bookingId!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: AssignmentType, example: AssignmentType.DELIVERY_PARTNER })
  type!: AssignmentType;

  @ApiProperty({ enum: AssignmentStatus, example: AssignmentStatus.ASSIGNED })
  status!: AssignmentStatus;

  @ApiPropertyOptional({ example: 'Apartment gate requires resident pass' })
  notes?: string | null;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  assignedAt!: Date;

  @ApiPropertyOptional()
  acceptedAt?: Date | null;

  @ApiProperty({
    example: {
      recipientName: 'Anita Sharma',
      recipientPhone: '+919876543210',
      addressLine1: 'No 45, Anna Nagar 2nd Street',
      addressLine2: 'Near Roundtana',
      area: 'Anna Nagar',
      city: 'Chennai',
      postalCode: '600040',
      latitude: '13.0850',
      longitude: '80.2100',
    },
  })
  address!: {
    recipientName: string;
    recipientPhone: string;
    addressLine1: string;
    addressLine2?: string | null;
    area: string;
    city: string;
    postalCode: string;
    latitude?: string | null;
    longitude?: string | null;
  };

  @ApiProperty({
    example: {
      pickupDate: '2026-09-15',
      pickupTimeSlot: '10:00 AM - 12:00 PM',
      specialInstructions: 'Ring doorbell twice',
    },
  })
  schedule!: {
    pickupDate: string;
    pickupTimeSlot: string;
    specialInstructions?: string | null;
  };

  @ApiProperty({ example: 2 })
  totalPackageCount!: number;

  @ApiProperty({ type: [AssignmentHistoryResponseDto] })
  history!: AssignmentHistoryResponseDto[];
}

export class DeliveryPartnerAssignmentListItemDto {
  @ApiProperty({ example: 'b6f001e2-9d32-4e08-bfb8-936eb2ef24f8' })
  id!: string;

  @ApiProperty({ example: 'ASN-2026-000001' })
  publicId!: string;

  @ApiProperty({ example: 'a5f001e2-9d32-4e08-bfb8-936eb2ef24f7' })
  bookingId!: string;

  @ApiProperty({ example: 'WAS-2026-000001' })
  bookingNumber!: string;

  @ApiProperty({ enum: AssignmentType, example: AssignmentType.DELIVERY_PARTNER })
  type!: AssignmentType;

  @ApiProperty({ enum: AssignmentStatus, example: AssignmentStatus.ASSIGNED })
  status!: AssignmentStatus;

  @ApiProperty({ example: '2026-09-15T10:00:00.000Z' })
  scheduledAt!: Date;

  @ApiProperty({ example: 'Anna Nagar' })
  area!: string;

  @ApiProperty({ example: 'Chennai' })
  city!: string;

  @ApiProperty({ example: '2026-09-12T10:00:00.000Z' })
  assignedAt!: Date;

  @ApiPropertyOptional()
  acceptedAt?: Date | null;
}

// ----------------------------------------------------------------------
// ELIGIBILITY & CANDIDATE EVALUATION DTOS
// ----------------------------------------------------------------------

export class AssignmentEligibilityResponseDto {
  @ApiProperty({ example: true })
  isEligible!: boolean;

  @ApiPropertyOptional({ example: 'PROVIDER_OUTSIDE_SERVICE_AREA' })
  errorCode?: string;

  @ApiPropertyOptional({ example: 'Provider does not service postal code 600040' })
  reason?: string;

  @ApiPropertyOptional()
  details?: Record<string, any>;
}

export class CandidateProviderResponseDto {
  @ApiProperty({ example: 'PRO-0001' })
  id!: string;

  @ApiProperty({ example: 'Sparkle Cleaners' })
  name!: string;

  @ApiProperty({ example: 4.8 })
  rating!: number;

  @ApiProperty({ example: 'Chennai' })
  city!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'APPROVED' })
  approvalStatus!: string;

  @ApiProperty({ example: ['Dry Cleaning', 'Steam Press'] })
  serviceCategories!: string[];

  @ApiProperty({ example: ['Anna Nagar', 'Kilpauk'] })
  areasServed!: string[];

  @ApiProperty({ example: 3 })
  activeBookingsCount!: number;

  @ApiProperty({ example: 'Low' })
  workload!: 'Low' | 'Medium' | 'High';

  @ApiProperty({ example: true })
  categoryMatch!: boolean;

  @ApiProperty({ example: true })
  cityMatch!: boolean;

  @ApiProperty({ example: true })
  areaMatch!: boolean;

  @ApiProperty({ example: true })
  isEligible!: boolean;

  @ApiProperty({ example: ['Covers location 600040', 'Available during slot'] })
  eligibilityReasons!: string[];
}

export class CandidateDeliveryPartnerResponseDto {
  @ApiProperty({ example: 'DLP-0001' })
  id!: string;

  @ApiProperty({ example: 'Karthik Raja' })
  name!: string;

  @ApiProperty({ example: 4.9 })
  rating!: number;

  @ApiProperty({ example: 'Chennai' })
  city!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'APPROVED' })
  approvalStatus!: string;

  @ApiProperty({ example: ['Anna Nagar', 'Kilpauk'] })
  areasServed!: string[];

  @ApiProperty({ example: 1 })
  activeDeliveriesCount!: number;

  @ApiProperty({ example: 'Low' })
  workload!: 'Low' | 'Medium' | 'High';

  @ApiProperty({ example: 'BIKE' })
  vehicleType!: string;

  @ApiProperty({ example: true })
  cityMatch!: boolean;

  @ApiProperty({ example: true })
  areaMatch!: boolean;

  @ApiProperty({ example: true })
  isEligible!: boolean;

  @ApiProperty({ example: ['Covers postal code 600040', 'Available on Friday'] })
  eligibilityReasons!: string[];
}
