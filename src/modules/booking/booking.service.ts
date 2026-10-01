import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AddressStatus,
  BookingStatus,
  CatalogStatus,
  Prisma,
  ProviderApprovalStatus,
  ProviderStatus,
  UserStatus,
} from '@prisma/client';
import { CatalogRepository } from '../catalog/catalog.repository';
import { CustomerRepository } from '../customer/customer.repository';
import { ProviderRepository } from '../provider/provider.repository';
import { BookingRepository } from './booking.repository';
import {
  BookingAddressResponseDto,
  BookingItemResponseDto,
  BookingNoteResponseDto,
  BookingQueryDto,
  BookingScheduleResponseDto,
  BookingStatusHistoryResponseDto,
  CancelBookingDto,
  CreateBookingDto,
  CreateBookingNoteDto,
  CustomerBookingDetailResponseDto,
  CustomerBookingListItemResponseDto,
  ProviderBookingAddressResponseDto,
  ProviderBookingDetailResponseDto,
  ProviderBookingListItemResponseDto,
  RescheduleBookingDto,
} from './dto';
import { BookingAuditEventType, BookingErrorCode } from './types/booking.types';

@Injectable()
export class BookingService {
  private readonly idempotencyCache = new Map<
    string,
    { bookingId: string; timestamp: number }
  >();

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly catalogRepository: CatalogRepository,
    private readonly providerRepository: ProviderRepository,
  ) {}

  // ==========================================================================
  // CUSTOMER BOOKING FLOWS
  // ==========================================================================

  /**
   * Resolve and validate customer by authenticated user ID and organization.
   */
  async resolveCustomer(userId: string, organizationId: string) {
    const customer = await this.customerRepository.findCustomerByUserAndOrg(
      userId,
      organizationId,
    );
    if (!customer) {
      throw new NotFoundException({
        code: BookingErrorCode.CUSTOMER_NOT_FOUND,
        message: 'Customer profile not found for active user in current organization.',
      });
    }

    if (customer.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: BookingErrorCode.CUSTOMER_INACTIVE,
        message: 'Customer account is suspended. Booking creation is not permitted.',
      });
    }

    if (customer.status === UserStatus.INACTIVE) {
      throw new ForbiddenException({
        code: BookingErrorCode.CUSTOMER_INACTIVE,
        message: 'Customer account is inactive. Booking creation is not permitted.',
      });
    }

    return customer;
  }

  /**
   * Create booking atomically with item snapshots, address snapshot, schedule, and initial status history.
   */
  async createBooking(
    userId: string,
    organizationId: string,
    dto: CreateBookingDto,
    idempotencyKey?: string,
  ): Promise<CustomerBookingDetailResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    // 1. Check Idempotency Key (if supplied)
    if (idempotencyKey) {
      const cacheKey = `${organizationId}:${customer.id}:${idempotencyKey}`;
      const cached = this.idempotencyCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 1000 * 60 * 10) {
        const existing = await this.bookingRepository.findCustomerBookingById(
          cached.bookingId,
          customer.id,
          organizationId,
        );
        if (existing) {
          return this.mapBookingToCustomerDetail(existing);
        }
      }
    }

    // 2. Validate Schedule Dates
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (dto.pickupDate < todayStr) {
      throw new BadRequestException({
        code: BookingErrorCode.INVALID_BOOKING_DATE,
        message: `Pickup date '${dto.pickupDate}' cannot be in the past.`,
      });
    }

    const maxDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    if (dto.pickupDate > maxDateStr) {
      throw new BadRequestException({
        code: BookingErrorCode.BOOKING_WINDOW_EXCEEDED,
        message: `Pickup date '${dto.pickupDate}' exceeds maximum advance booking window (14 days).`,
      });
    }

    if (dto.returnDate && dto.returnDate < dto.pickupDate) {
      throw new BadRequestException({
        code: BookingErrorCode.INVALID_BOOKING_DATE,
        message: `Return date '${dto.returnDate}' cannot precede pickup date '${dto.pickupDate}'.`,
      });
    }

    // 3. Validate and Snapshot Customer Address
    const address = await this.customerRepository.findAddressById(
      dto.addressId,
      customer.id,
      organizationId,
    );

    if (!address) {
      throw new NotFoundException({
        code: BookingErrorCode.ADDRESS_NOT_FOUND,
        message: `Address '${dto.addressId}' not found for current customer.`,
      });
    }

    if (address.status !== AddressStatus.ACTIVE) {
      throw new BadRequestException({
        code: BookingErrorCode.ADDRESS_INACTIVE,
        message: 'Cannot create booking with inactive address.',
      });
    }

    // 4. Validate Provider (if specified)
    let validatedProviderId: string | undefined = undefined;
    if (dto.providerId) {
      const provider = await this.providerRepository.findProviderByIdOrPublicId(
        dto.providerId,
        organizationId,
      );
      if (
        !provider ||
        provider.status !== ProviderStatus.ACTIVE ||
        provider.approvalStatus !== ProviderApprovalStatus.APPROVED
      ) {
        throw new BadRequestException({
          code: BookingErrorCode.PROVIDER_NOT_AVAILABLE,
          message: `Provider '${dto.providerId}' is not currently available for booking.`,
        });
      }
      validatedProviderId = provider.id;
    }

    // 5. Validate Catalog Services & Variants, and Snapshot Prices
    let primaryServiceId = '';
    let totalSubtotal = 0;
    const itemSnapshots: Array<{
      variantId?: string;
      serviceNameSnapshot: string;
      variantNameSnapshot?: string;
      unitPrice: Prisma.Decimal;
      quantity: number;
      totalAmount: Prisma.Decimal;
    }> = [];

    for (let i = 0; i < dto.items.length; i++) {
      const itemInput = dto.items[i];
      const service = await this.catalogRepository.findServiceByIdOrPublicId(
        itemInput.serviceId,
        organizationId,
      );

      if (!service) {
        throw new NotFoundException({
          code: BookingErrorCode.SERVICE_NOT_FOUND,
          message: `Service '${itemInput.serviceId}' not found in current organization.`,
        });
      }

      if (service.status !== CatalogStatus.ACTIVE) {
        throw new BadRequestException({
          code: BookingErrorCode.SERVICE_NOT_AVAILABLE,
          message: `Service '${service.name}' is not currently available for booking.`,
        });
      }

      if (i === 0) {
        primaryServiceId = service.id;
      }

      let variantName: string | undefined = undefined;
      let variantDbId: string | undefined = undefined;
      let unitPrice = Number(service.basePrice);

      if (itemInput.variantId) {
        const variant = await this.catalogRepository.findVariantByIdOrPublicId(
          itemInput.variantId,
          organizationId,
        );

        if (!variant || variant.serviceId !== service.id) {
          throw new BadRequestException({
            code: BookingErrorCode.VARIANT_SERVICE_MISMATCH,
            message: `Variant '${itemInput.variantId}' does not belong to service '${service.name}'.`,
          });
        }

        if (variant.status !== CatalogStatus.ACTIVE) {
          throw new BadRequestException({
            code: BookingErrorCode.VARIANT_NOT_AVAILABLE,
            message: `Variant '${variant.name}' is not currently active.`,
          });
        }

        variantName = variant.name;
        variantDbId = variant.id;
        unitPrice =
          Number(service.basePrice) * Number(variant.priceMultiplier) +
          Number(variant.additionalPrice);
      }

      const lineTotal = unitPrice * itemInput.quantity;
      totalSubtotal += lineTotal;

      itemSnapshots.push({
        variantId: variantDbId,
        serviceNameSnapshot: service.name,
        variantNameSnapshot: variantName,
        unitPrice: new Prisma.Decimal(unitPrice),
        quantity: itemInput.quantity,
        totalAmount: new Prisma.Decimal(lineTotal),
      });
    }

    // 6. Generate Booking Number & Scheduled Timestamp
    const scheduledAt = new Date(`${dto.pickupDate}T00:00:00.000Z`);

    // 7. Atomic Creation
    const createdBooking = await this.bookingRepository.createBookingWithSnapshots({
      organizationId,
      customerId: customer.id,
      serviceId: primaryServiceId,
      providerId: validatedProviderId,
      bookingNumber: await this.generateUniqueBookingNumber(organizationId),
      subtotal: new Prisma.Decimal(totalSubtotal),
      serviceFee: new Prisma.Decimal(0.0),
      taxAmount: new Prisma.Decimal(0.0),
      discountAmount: new Prisma.Decimal(0.0),
      rewardDiscount: new Prisma.Decimal(0.0),
      totalAmount: new Prisma.Decimal(totalSubtotal),
      currency: 'INR',
      scheduledAt,
      status: BookingStatus.PENDING,
      items: itemSnapshots,
      address: {
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        area: address.area,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        landmark: address.landmark,
        latitude: address.latitude,
        longitude: address.longitude,
      },
      schedule: {
        pickupDate: new Date(dto.pickupDate),
        pickupTimeSlot: dto.pickupTimeSlot,
        returnDate: dto.returnDate ? new Date(dto.returnDate) : null,
        returnTimeSlot: dto.returnTimeSlot,
        specialInstructions: dto.specialInstructions,
      },
      statusHistory: {
        fromStatus: null,
        toStatus: BookingStatus.PENDING,
        changedByUserId: userId,
        reason: 'Booking requested by customer',
      },
      initialNote: dto.specialInstructions
        ? {
            authorUserId: userId,
            note: dto.specialInstructions,
            isInternalOnly: false,
          }
        : undefined,
    });

    // Cache idempotency key
    if (idempotencyKey) {
      const cacheKey = `${organizationId}:${customer.id}:${idempotencyKey}`;
      this.idempotencyCache.set(cacheKey, {
        bookingId: createdBooking.id,
        timestamp: Date.now(),
      });
    }

    // Audit event
    await this.bookingRepository.createAuditEvent({
      organizationId,
      userId,
      action: BookingAuditEventType.BOOKING_CREATED,
      entityType: 'Booking',
      entityId: createdBooking.id,
      metadataJson: {
        bookingNumber: createdBooking.bookingNumber,
        totalAmount: totalSubtotal,
        itemsCount: itemSnapshots.length,
      },
    });

    return this.mapBookingToCustomerDetail(createdBooking);
  }

  private async generateUniqueBookingNumber(organizationId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `WAS-${currentYear}-`;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const count = await this.bookingRepository.findCustomerBookings('', organizationId, {}).then((r) => r.total).catch(() => 0);
    return `${prefix}${String(count + 1).padStart(4, '0')}-${randomSuffix}`;
  }

  /**
   * List customer bookings with pagination and filters.
   */
  async getCustomerBookings(
    userId: string,
    organizationId: string,
    query: BookingQueryDto,
  ): Promise<{
    items: CustomerBookingListItemResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.bookingRepository.findCustomerBookings(
      customer.id,
      organizationId,
      {
        status: query.status,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        search: query.search,
        skip,
        take: limit,
      },
    );

    return {
      items: items.map((b) => this.mapBookingToCustomerListItem(b)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get customer booking detail by UUID or booking number.
   */
  async getCustomerBookingById(
    userId: string,
    organizationId: string,
    bookingId: string,
  ): Promise<CustomerBookingDetailResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const booking = await this.bookingRepository.findCustomerBookingById(
      bookingId,
      customer.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found.`,
      });
    }

    return this.mapBookingToCustomerDetail(booking);
  }

  /**
   * Cancel customer booking.
   */
  async cancelCustomerBooking(
    userId: string,
    organizationId: string,
    bookingId: string,
    dto: CancelBookingDto,
  ): Promise<CustomerBookingDetailResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const booking = await this.bookingRepository.findCustomerBookingById(
      bookingId,
      customer.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found.`,
      });
    }

    // Terminal statuses cannot be cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException({
        code: BookingErrorCode.BOOKING_CANCELLATION_NOT_ALLOWED,
        message: 'Booking is already cancelled.',
      });
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException({
        code: BookingErrorCode.BOOKING_CANCELLATION_NOT_ALLOWED,
        message: 'Completed bookings cannot be cancelled.',
      });
    }

    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException({
        code: BookingErrorCode.BOOKING_CANCELLATION_NOT_ALLOWED,
        message: `Booking in status '${booking.status}' cannot be cancelled.`,
      });
    }

    const updated = await this.bookingRepository.updateBookingStatus(booking.id, organizationId, {
      fromStatus: booking.status,
      toStatus: BookingStatus.CANCELLED,
      changedByUserId: userId,
      reason: dto.reason,
      cancellationReason: dto.reason,
      cancelledAt: new Date(),
    });

    await this.bookingRepository.createAuditEvent({
      organizationId,
      userId,
      action: BookingAuditEventType.BOOKING_CANCELLED,
      entityType: 'Booking',
      entityId: booking.id,
      metadataJson: { reason: dto.reason, previousStatus: booking.status },
    });

    return this.mapBookingToCustomerDetail(updated);
  }

  /**
   * Reschedule customer booking.
   */
  async rescheduleCustomerBooking(
    userId: string,
    organizationId: string,
    bookingId: string,
    dto: RescheduleBookingDto,
  ): Promise<CustomerBookingDetailResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const booking = await this.bookingRepository.findCustomerBookingById(
      bookingId,
      customer.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found.`,
      });
    }

    // Terminal statuses cannot be rescheduled
    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException({
        code: BookingErrorCode.BOOKING_RESCHEDULE_NOT_ALLOWED,
        message: `Cannot reschedule a ${booking.status.toLowerCase()} booking.`,
      });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (dto.pickupDate < todayStr) {
      throw new BadRequestException({
        code: BookingErrorCode.INVALID_BOOKING_DATE,
        message: `New pickup date '${dto.pickupDate}' cannot be in the past.`,
      });
    }

    const maxDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    if (dto.pickupDate > maxDateStr) {
      throw new BadRequestException({
        code: BookingErrorCode.BOOKING_WINDOW_EXCEEDED,
        message: `New pickup date '${dto.pickupDate}' exceeds maximum booking advance window (14 days).`,
      });
    }

    const newScheduledAt = new Date(`${dto.pickupDate}T00:00:00.000Z`);

    const updated = await this.bookingRepository.updateBookingSchedule(booking.id, organizationId, {
      pickupDate: new Date(dto.pickupDate),
      pickupTimeSlot: dto.pickupTimeSlot,
      returnDate: dto.returnDate ? new Date(dto.returnDate) : null,
      returnTimeSlot: dto.returnTimeSlot,
      scheduledAt: newScheduledAt,
      changedByUserId: userId,
      reason: dto.reason ?? 'Rescheduled by customer',
    });

    await this.bookingRepository.createAuditEvent({
      organizationId,
      userId,
      action: BookingAuditEventType.BOOKING_RESCHEDULED,
      entityType: 'Booking',
      entityId: booking.id,
      metadataJson: {
        newPickupDate: dto.pickupDate,
        newPickupTimeSlot: dto.pickupTimeSlot,
      },
    });

    return this.mapBookingToCustomerDetail(updated);
  }

  /**
   * Add a note to customer booking.
   */
  async addCustomerBookingNote(
    userId: string,
    organizationId: string,
    bookingId: string,
    dto: CreateBookingNoteDto,
  ): Promise<BookingNoteResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const booking = await this.bookingRepository.findCustomerBookingById(
      bookingId,
      customer.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found.`,
      });
    }

    const note = await this.bookingRepository.createBookingNote(booking.id, organizationId, {
      authorUserId: userId,
      note: dto.note.trim(),
      isInternalOnly: false,
    });

    await this.bookingRepository.createAuditEvent({
      organizationId,
      userId,
      action: BookingAuditEventType.BOOKING_NOTE_CREATED,
      entityType: 'BookingNote',
      entityId: note.id,
      metadataJson: { bookingId: booking.id },
    });

    return {
      id: note.id,
      note: note.note,
      createdAt: note.createdAt,
    };
  }

  /**
   * Get notes for customer booking.
   */
  async getCustomerBookingNotes(
    userId: string,
    organizationId: string,
    bookingId: string,
  ): Promise<BookingNoteResponseDto[]> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const booking = await this.bookingRepository.findCustomerBookingById(
      bookingId,
      customer.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found.`,
      });
    }

    const notes = await this.bookingRepository.findBookingNotes(booking.id, organizationId);
    return notes.map((n) => ({
      id: n.id,
      note: n.note,
      createdAt: n.createdAt,
    }));
  }

  /**
   * Get status history for customer booking.
   */
  async getCustomerBookingStatusHistory(
    userId: string,
    organizationId: string,
    bookingId: string,
  ): Promise<BookingStatusHistoryResponseDto[]> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const booking = await this.bookingRepository.findCustomerBookingById(
      bookingId,
      customer.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found.`,
      });
    }

    const history = await this.bookingRepository.findStatusHistory(booking.id, organizationId);
    return history.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      reason: h.reason,
      createdAt: h.createdAt,
    }));
  }

  // ==========================================================================
  // PROVIDER BOOKING READ FLOWS
  // ==========================================================================

  /**
   * Resolve authenticated provider.
   */
  async resolveProvider(userId: string, organizationId: string) {
    const provider = await this.providerRepository.findProviderByUserAndOrg(
      userId,
      organizationId,
    );

    if (!provider) {
      throw new NotFoundException({
        code: BookingErrorCode.PROVIDER_BOOKING_ACCESS_DENIED,
        message: 'Provider profile not found for active user in current organization.',
      });
    }

    return provider;
  }

  /**
   * List provider bookings.
   */
  async getProviderBookings(
    userId: string,
    organizationId: string,
    query: BookingQueryDto,
  ): Promise<{
    items: ProviderBookingListItemResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const provider = await this.resolveProvider(userId, organizationId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.bookingRepository.findProviderBookings(
      provider.id,
      organizationId,
      {
        status: query.status,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        search: query.search,
        skip,
        take: limit,
      },
    );

    return {
      items: items.map((b) => this.mapBookingToProviderListItem(b)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get provider booking detail (redacted customer details).
   */
  async getProviderBookingById(
    userId: string,
    organizationId: string,
    bookingId: string,
  ): Promise<ProviderBookingDetailResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);
    const booking = await this.bookingRepository.findProviderBookingById(
      bookingId,
      provider.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found for current provider.`,
      });
    }

    return this.mapBookingToProviderDetail(booking);
  }

  /**
   * Get provider booking status history.
   */
  async getProviderBookingStatusHistory(
    userId: string,
    organizationId: string,
    bookingId: string,
  ): Promise<BookingStatusHistoryResponseDto[]> {
    const provider = await this.resolveProvider(userId, organizationId);
    const booking = await this.bookingRepository.findProviderBookingById(
      bookingId,
      provider.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found for current provider.`,
      });
    }

    const history = await this.bookingRepository.findStatusHistory(booking.id, organizationId);
    return history.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      reason: h.reason,
      createdAt: h.createdAt,
    }));
  }

  /**
   * Get provider booking notes.
   */
  async getProviderBookingNotes(
    userId: string,
    organizationId: string,
    bookingId: string,
  ): Promise<BookingNoteResponseDto[]> {
    const provider = await this.resolveProvider(userId, organizationId);
    const booking = await this.bookingRepository.findProviderBookingById(
      bookingId,
      provider.id,
      organizationId,
    );

    if (!booking) {
      throw new NotFoundException({
        code: BookingErrorCode.BOOKING_NOT_FOUND,
        message: `Booking '${bookingId}' not found for current provider.`,
      });
    }

    const notes = await this.bookingRepository.findBookingNotes(booking.id, organizationId);
    return notes.map((n) => ({
      id: n.id,
      note: n.note,
      createdAt: n.createdAt,
    }));
  }

  // ==========================================================================
  // RESPONSE MAPPERS
  // ==========================================================================

  private mapBookingToCustomerListItem(booking: any): CustomerBookingListItemResponseDto {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      subtotal: Number(booking.subtotal),
      totalAmount: Number(booking.totalAmount),
      currency: booking.currency,
      scheduledAt: booking.scheduledAt,
      itemsCount: booking.items?.length ?? 0,
      primaryServiceName: booking.service?.name ?? 'Laundry Service',
      createdAt: booking.createdAt,
    };
  }

  private mapBookingToCustomerDetail(booking: any): CustomerBookingDetailResponseDto {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      subtotal: Number(booking.subtotal),
      serviceFee: Number(booking.serviceFee),
      taxAmount: Number(booking.taxAmount),
      totalAmount: Number(booking.totalAmount),
      currency: booking.currency,
      scheduledAt: booking.scheduledAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      items: (booking.items || []).map((item: any) => ({
        id: item.id,
        serviceName: item.serviceNameSnapshot,
        variantName: item.variantNameSnapshot,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        totalAmount: Number(item.totalAmount),
      })),
      address: booking.address
        ? {
            recipientName: booking.address.recipientName,
            recipientPhone: booking.address.recipientPhone,
            addressLine1: booking.address.addressLine1,
            addressLine2: booking.address.addressLine2,
            area: booking.address.area,
            city: booking.address.city,
            state: booking.address.state,
            postalCode: booking.address.postalCode,
            landmark: booking.address.landmark,
            latitude: booking.address.latitude ? Number(booking.address.latitude) : null,
            longitude: booking.address.longitude ? Number(booking.address.longitude) : null,
          }
        : null,
      schedule: booking.schedule
        ? {
            pickupDate: booking.schedule.pickupDate instanceof Date
              ? booking.schedule.pickupDate.toISOString().split('T')[0]
              : String(booking.schedule.pickupDate),
            pickupTimeSlot: booking.schedule.pickupTimeSlot,
            returnDate: booking.schedule.returnDate
              ? booking.schedule.returnDate instanceof Date
                ? booking.schedule.returnDate.toISOString().split('T')[0]
                : String(booking.schedule.returnDate)
              : null,
            returnTimeSlot: booking.schedule.returnTimeSlot,
            specialInstructions: booking.schedule.specialInstructions,
          }
        : null,
      statusHistory: (booking.statusHistory || []).map((h: any) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        reason: h.reason,
        createdAt: h.createdAt,
      })),
      notes: (booking.notes || []).map((n: any) => ({
        id: n.id,
        note: n.note,
        createdAt: n.createdAt,
      })),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  private mapBookingToProviderListItem(booking: any): ProviderBookingListItemResponseDto {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      totalAmount: Number(booking.totalAmount),
      currency: booking.currency,
      scheduledAt: booking.scheduledAt,
      itemsCount: booking.items?.length ?? 0,
      primaryServiceName: booking.service?.name ?? 'Laundry Service',
      createdAt: booking.createdAt,
    };
  }

  private mapBookingToProviderDetail(booking: any): ProviderBookingDetailResponseDto {
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      totalAmount: Number(booking.totalAmount),
      currency: booking.currency,
      scheduledAt: booking.scheduledAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      items: (booking.items || []).map((item: any) => ({
        id: item.id,
        serviceName: item.serviceNameSnapshot,
        variantName: item.variantNameSnapshot,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        totalAmount: Number(item.totalAmount),
      })),
      address: booking.address
        ? {
            recipientName: booking.address.recipientName,
            addressLine1: booking.address.addressLine1,
            addressLine2: booking.address.addressLine2,
            area: booking.address.area,
            city: booking.address.city,
            state: booking.address.state,
            postalCode: booking.address.postalCode,
            landmark: booking.address.landmark,
          }
        : null,
      schedule: booking.schedule
        ? {
            pickupDate: booking.schedule.pickupDate instanceof Date
              ? booking.schedule.pickupDate.toISOString().split('T')[0]
              : String(booking.schedule.pickupDate),
            pickupTimeSlot: booking.schedule.pickupTimeSlot,
            returnDate: booking.schedule.returnDate
              ? booking.schedule.returnDate instanceof Date
                ? booking.schedule.returnDate.toISOString().split('T')[0]
                : String(booking.schedule.returnDate)
              : null,
            returnTimeSlot: booking.schedule.returnTimeSlot,
            specialInstructions: booking.schedule.specialInstructions,
          }
        : null,
      statusHistory: (booking.statusHistory || []).map((h: any) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        reason: h.reason,
        createdAt: h.createdAt,
      })),
      notes: (booking.notes || []).map((n: any) => ({
        id: n.id,
        note: n.note,
        createdAt: n.createdAt,
      })),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
