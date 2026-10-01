import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { AdminRepository } from '../admin.repository';
import {
  AdminCancelBookingDto,
  AdminCreateBookingNoteDto,
  AdminRescheduleBookingDto,
  BookingAdminQueryDto,
} from '../dto/booking-admin.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminBookingService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async listBookings(orgId: string, query: BookingAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findBookings(orgId, {
      bookingId: query.bookingId,
      customerId: query.customerId,
      providerId: query.providerId,
      deliveryPartnerId: query.deliveryPartnerId,
      serviceId: query.serviceId,
      status: query.status,
      paymentStatus: query.paymentStatus,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
      skip,
      take: limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBooking(orgId: string, bookingId: string) {
    const booking = await this.adminRepo.findBookingById(bookingId, orgId);
    if (!booking) {
      throw new NotFoundException({
        code: AdminErrorCode.BOOKING_NOT_FOUND,
        message: `Booking ${bookingId} not found`,
      });
    }
    return booking;
  }

  async cancelBooking(
    orgId: string,
    bookingId: string,
    dto: AdminCancelBookingDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const booking = await this.getBooking(orgId, bookingId);

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException({
        code: AdminErrorCode.BOOKING_INVALID_STATE_TRANSITION,
        message: `Cannot cancel booking with current status: ${booking.status}`,
      });
    }

    const updated = await this.adminRepo.cancelBooking(
      booking.id,
      orgId,
      dto.reason,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.BOOKING_CANCELLED,
      entityType: 'Booking',
      entityId: booking.id,
      metadata: { reason: dto.reason, previousStatus: booking.status },
      ipHash: ipAddress,
    });

    return updated;
  }

  async rescheduleBooking(
    orgId: string,
    bookingId: string,
    dto: AdminRescheduleBookingDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const booking = await this.getBooking(orgId, bookingId);

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException({
        code: AdminErrorCode.BOOKING_INVALID_STATE_TRANSITION,
        message: `Cannot reschedule booking with status ${booking.status}`,
      });
    }

    const dateStr = dto.scheduledDate || dto.pickupDate;
    if (!dateStr) {
      throw new BadRequestException({
        code: AdminErrorCode.VALIDATION_ERROR,
        message: 'Must provide scheduledDate or pickupDate',
      });
    }

    const newDate = new Date(dateStr);
    if (isNaN(newDate.getTime())) {
      throw new BadRequestException({
        code: AdminErrorCode.VALIDATION_ERROR,
        message: 'Invalid scheduled date format',
      });
    }

    const slotStr = dto.timeSlot || dto.pickupTimeSlot || 'STANDARD';

    const updated = await this.adminRepo.rescheduleBooking(
      booking.id,
      orgId,
      newDate,
      slotStr,
      dto.reason || 'Operational reschedule',
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.BOOKING_RESCHEDULED,
      entityType: 'Booking',
      entityId: booking.id,
      metadata: {
        scheduledDate: dateStr,
        timeSlot: slotStr,
        reason: dto.reason,
      },
      ipHash: ipAddress,
    });

    return updated;
  }

  async createBookingNote(
    orgId: string,
    bookingId: string,
    dto: AdminCreateBookingNoteDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const booking = await this.getBooking(orgId, bookingId);

    const note = await this.adminRepo.createBookingNote({
      bookingId: booking.id,
      organizationId: orgId,
      authorUserId: actorUserId,
      note: dto.note,
      isInternalOnly: dto.isInternalOnly ?? true,
    });

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.BOOKING_NOTE_ADDED,
      entityType: 'Booking',
      entityId: booking.id,
      metadata: { noteId: note.id, isInternalOnly: note.isInternalOnly },
      ipHash: ipAddress,
    });

    return note;
  }

  async getBookingAssignments(orgId: string, bookingId: string) {
    const booking = await this.getBooking(orgId, bookingId);
    return this.adminRepo.findBookingAssignments(booking.id, orgId);
  }

  async getBookingPayments(orgId: string, bookingId: string) {
    const booking = await this.getBooking(orgId, bookingId);
    return this.adminRepo.findBookingPayments(booking.id, orgId);
  }

  async getBookingStatusHistory(orgId: string, bookingId: string) {
    const booking = await this.getBooking(orgId, bookingId);
    return this.adminRepo.findBookingStatusHistory(booking.id, orgId);
  }
}
