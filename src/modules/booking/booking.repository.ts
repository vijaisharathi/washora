import { Injectable } from '@nestjs/common';
import {
  Booking,
  BookingAddress,
  BookingItem,
  BookingNote,
  BookingSchedule,
  BookingStatus,
  BookingStatusHistory,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export interface CreateBookingTransactionData {
  organizationId: string;
  customerId: string;
  serviceId: string;
  providerId?: string;
  bookingNumber: string;
  subtotal: Prisma.Decimal;
  serviceFee: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  rewardDiscount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  currency: string;
  scheduledAt: Date;
  status: BookingStatus;
  items: Array<{
    variantId?: string;
    serviceNameSnapshot: string;
    variantNameSnapshot?: string;
    unitPrice: Prisma.Decimal;
    quantity: number;
    totalAmount: Prisma.Decimal;
  }>;
  address: {
    recipientName: string;
    recipientPhone: string;
    addressLine1: string;
    addressLine2?: string | null;
    area: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string | null;
    latitude?: Prisma.Decimal | null;
    longitude?: Prisma.Decimal | null;
  };
  schedule: {
    pickupDate: Date;
    pickupTimeSlot: string;
    returnDate?: Date | null;
    returnTimeSlot?: string | null;
    specialInstructions?: string | null;
  };
  statusHistory: {
    fromStatus?: BookingStatus | null;
    toStatus: BookingStatus;
    changedByUserId?: string;
    reason?: string;
    note?: string;
  };
  initialNote?: {
    authorUserId: string;
    note: string;
    isInternalOnly?: boolean;
  };
}

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates next sequential booking number within current year and organization:
   * e.g. WAS-2026-000001
   */
  async generateBookingNumber(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `WAS-${currentYear}-`;

    const latest = await tx.booking.findFirst({
      where: {
        organizationId,
        bookingNumber: { startsWith: prefix },
      },
      orderBy: { createdAt: 'desc' },
      select: { bookingNumber: true },
    });

    let nextSeq = 1;
    if (latest && latest.bookingNumber) {
      const numPart = latest.bookingNumber.replace(prefix, '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  /**
   * Atomically creates a Booking with items, address snapshot, schedule, and initial status history.
   */
  async createBookingWithSnapshots(
    data: CreateBookingTransactionData,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Booking Header
      const booking = await tx.booking.create({
        data: {
          organizationId: data.organizationId,
          customerId: data.customerId,
          serviceId: data.serviceId,
          providerId: data.providerId,
          bookingNumber: data.bookingNumber,
          subtotal: data.subtotal,
          serviceFee: data.serviceFee,
          taxAmount: data.taxAmount,
          discountAmount: data.discountAmount,
          rewardDiscount: data.rewardDiscount,
          totalAmount: data.totalAmount,
          currency: data.currency,
          scheduledAt: data.scheduledAt,
          status: data.status,
        },
      });

      // 2. Create Booking Items Snapshots
      const items = await Promise.all(
        data.items.map((item) =>
          tx.bookingItem.create({
            data: {
              bookingId: booking.id,
              organizationId: data.organizationId,
              variantId: item.variantId,
              serviceNameSnapshot: item.serviceNameSnapshot,
              variantNameSnapshot: item.variantNameSnapshot,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalAmount: item.totalAmount,
            },
          }),
        ),
      );

      // 3. Create Booking Address Snapshot
      const address = await tx.bookingAddress.create({
        data: {
          bookingId: booking.id,
          organizationId: data.organizationId,
          recipientName: data.address.recipientName,
          recipientPhone: data.address.recipientPhone,
          addressLine1: data.address.addressLine1,
          addressLine2: data.address.addressLine2,
          area: data.address.area,
          city: data.address.city,
          state: data.address.state,
          postalCode: data.address.postalCode,
          landmark: data.address.landmark,
          latitude: data.address.latitude,
          longitude: data.address.longitude,
        },
      });

      // 4. Create Booking Schedule
      const schedule = await tx.bookingSchedule.create({
        data: {
          bookingId: booking.id,
          organizationId: data.organizationId,
          pickupDate: data.schedule.pickupDate,
          pickupTimeSlot: data.schedule.pickupTimeSlot,
          returnDate: data.schedule.returnDate,
          returnTimeSlot: data.schedule.returnTimeSlot,
          specialInstructions: data.schedule.specialInstructions,
        },
      });

      // 5. Create Initial Status History
      const statusHistory = await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          organizationId: data.organizationId,
          fromStatus: data.statusHistory.fromStatus ?? null,
          toStatus: data.statusHistory.toStatus,
          changedByUserId: data.statusHistory.changedByUserId,
          reason: data.statusHistory.reason ?? 'Booking created',
          note: data.statusHistory.note,
        },
      });

      // 6. Optional Initial Note
      let noteRecord: BookingNote | null = null;
      if (data.initialNote) {
        noteRecord = await tx.bookingNote.create({
          data: {
            bookingId: booking.id,
            organizationId: data.organizationId,
            authorUserId: data.initialNote.authorUserId,
            note: data.initialNote.note,
            isInternalOnly: data.initialNote.isInternalOnly ?? false,
          },
        });
      }

      return {
        ...booking,
        items,
        address,
        schedule,
        statusHistory: [statusHistory],
        notes: noteRecord ? [noteRecord] : [],
      };
    });
  }

  /**
   * Find Customer Booking by UUID or Booking Number with ownership enforcement.
   */
  async findCustomerBookingById(
    identifier: string,
    customerId: string,
    organizationId: string,
  ) {
    return this.prisma.booking.findFirst({
      where: {
        organizationId,
        customerId,
        OR: [{ id: identifier }, { bookingNumber: identifier }],
      },
      include: {
        items: true,
        address: true,
        schedule: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        service: true,
      },
    });
  }

  /**
   * List Customer Bookings paginated with filters.
   */
  async findCustomerBookings(
    customerId: string,
    organizationId: string,
    options: {
      status?: BookingStatus;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    const where: Prisma.BookingWhereInput = {
      customerId,
      organizationId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.dateFrom || options.dateTo
        ? {
            scheduledAt: {
              ...(options.dateFrom ? { gte: new Date(options.dateFrom) } : {}),
              ...(options.dateTo ? { lte: new Date(options.dateTo) } : {}),
            },
          }
        : {}),
      ...(options.search
        ? {
            OR: [
              { bookingNumber: { contains: options.search, mode: 'insensitive' } },
              { service: { name: { contains: options.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.take,
        include: {
          items: true,
          service: true,
        },
      }),
    ]);

    return { items, total };
  }

  /**
   * Find Provider Booking by UUID or Booking Number with provider association enforcement.
   */
  async findProviderBookingById(
    identifier: string,
    providerId: string,
    organizationId: string,
  ) {
    return this.prisma.booking.findFirst({
      where: {
        organizationId,
        providerId,
        OR: [{ id: identifier }, { bookingNumber: identifier }],
      },
      include: {
        items: true,
        address: true,
        schedule: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        service: true,
      },
    });
  }

  /**
   * List Provider Bookings paginated with filters.
   */
  async findProviderBookings(
    providerId: string,
    organizationId: string,
    options: {
      status?: BookingStatus;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    const where: Prisma.BookingWhereInput = {
      providerId,
      organizationId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.dateFrom || options.dateTo
        ? {
            scheduledAt: {
              ...(options.dateFrom ? { gte: new Date(options.dateFrom) } : {}),
              ...(options.dateTo ? { lte: new Date(options.dateTo) } : {}),
            },
          }
        : {}),
      ...(options.search
        ? {
            OR: [
              { bookingNumber: { contains: options.search, mode: 'insensitive' } },
              { service: { name: { contains: options.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.take,
        include: {
          items: true,
          service: true,
        },
      }),
    ]);

    return { items, total };
  }

  /**
   * Atomically transitions booking status and appends status history.
   */
  async updateBookingStatus(
    bookingId: string,
    organizationId: string,
    data: {
      fromStatus?: BookingStatus;
      toStatus: BookingStatus;
      changedByUserId?: string;
      reason?: string;
      note?: string;
      cancellationReason?: string;
      cancelledAt?: Date;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: data.toStatus,
          ...(data.cancellationReason !== undefined
            ? { cancellationReason: data.cancellationReason }
            : {}),
          ...(data.cancelledAt !== undefined ? { cancelledAt: data.cancelledAt } : {}),
        },
        include: {
          items: true,
          address: true,
          schedule: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          notes: { orderBy: { createdAt: 'desc' } },
          service: true,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          organizationId,
          fromStatus: data.fromStatus,
          toStatus: data.toStatus,
          changedByUserId: data.changedByUserId,
          reason: data.reason,
          note: data.note,
        },
      });

      return updatedBooking;
    });
  }

  /**
   * Atomically updates booking schedule and appends status history.
   */
  async updateBookingSchedule(
    bookingId: string,
    organizationId: string,
    data: {
      pickupDate: Date;
      pickupTimeSlot: string;
      returnDate?: Date | null;
      returnTimeSlot?: string | null;
      scheduledAt: Date;
      changedByUserId?: string;
      reason?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update Booking scheduledAt
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          scheduledAt: data.scheduledAt,
        },
        include: {
          items: true,
          address: true,
          schedule: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          notes: { orderBy: { createdAt: 'desc' } },
          service: true,
        },
      });

      // 2. Update Schedule
      await tx.bookingSchedule.update({
        where: { bookingId },
        data: {
          pickupDate: data.pickupDate,
          pickupTimeSlot: data.pickupTimeSlot,
          returnDate: data.returnDate,
          returnTimeSlot: data.returnTimeSlot,
        },
      });

      // 3. Append history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          organizationId,
          fromStatus: updatedBooking.status,
          toStatus: updatedBooking.status,
          changedByUserId: data.changedByUserId,
          reason: data.reason ?? 'Booking rescheduled',
        },
      });

      return updatedBooking;
    });
  }

  /**
   * Add a note to a booking.
   */
  async createBookingNote(
    bookingId: string,
    organizationId: string,
    data: {
      authorUserId: string;
      note: string;
      isInternalOnly?: boolean;
    },
  ): Promise<BookingNote> {
    return this.prisma.bookingNote.create({
      data: {
        bookingId,
        organizationId,
        authorUserId: data.authorUserId,
        note: data.note,
        isInternalOnly: data.isInternalOnly ?? false,
      },
    });
  }

  /**
   * List notes for a booking.
   */
  async findBookingNotes(
    bookingId: string,
    organizationId: string,
  ): Promise<BookingNote[]> {
    return this.prisma.bookingNote.findMany({
      where: { bookingId, organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List status history for a booking.
   */
  async findStatusHistory(
    bookingId: string,
    organizationId: string,
  ): Promise<BookingStatusHistory[]> {
    return this.prisma.bookingStatusHistory.findMany({
      where: { bookingId, organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Record audit event.
   */
  async createAuditEvent(data: {
    organizationId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadataJson?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.prisma.auditEvent.create({
        data: {
          organizationId: data.organizationId,
          actorUserId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          metadataJson: data.metadataJson ? (data.metadataJson as Prisma.InputJsonValue) : undefined,
        },
      });
    } catch {
      // Non-blocking for audit logs
    }
  }
}
