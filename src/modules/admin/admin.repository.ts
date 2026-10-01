import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  RoleType,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // 1. ORGANIZATION
  // ============================================================================

  async findOrganizationById(orgId: string) {
    return this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            members: true,
            customers: true,
            providers: true,
            deliveryPartners: true,
            bookings: true,
          },
        },
      },
    });
  }

  async updateOrganization(orgId: string, data: Prisma.OrganizationUpdateInput) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data,
    });
  }

  // ============================================================================
  // 2. ORGANIZATION MEMBERS
  // ============================================================================

  async findMembers(
    orgId: string,
    options: {
      status?: string;
      role?: RoleType;
      search?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.OrganizationMemberWhereInput = {
      organizationId: orgId,
      ...(options.status ? { status: options.status as any } : {}),
      ...(options.role ? { role: { type: options.role } } : {}),
      ...(options.search
        ? {
            OR: [
              { fullName: { contains: options.search, mode: 'insensitive' } },
              { user: { email: { contains: options.search, mode: 'insensitive' } } },
              { phone: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.organizationMember.count({ where }),
      this.prisma.organizationMember.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              lastLoginAt: true,
              emailVerifiedAt: true,
              phoneVerifiedAt: true,
            },
          },
          role: true,
        },
      }),
    ]);

    return { total, items };
  }

  async findMemberById(memberId: string, orgId: string) {
    return this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId: orgId,
      },
      include: {
        user: true,
        role: true,
        organization: true,
      },
    });
  }

  async countActiveAdmins(orgId: string): Promise<number> {
    return this.prisma.organizationMember.count({
      where: {
        organizationId: orgId,
        status: 'ACTIVE',
        role: { type: RoleType.ADMIN },
      },
    });
  }

  async findRoleByType(roleType: RoleType) {
    return this.prisma.role.findUnique({
      where: { type: roleType },
    });
  }

  async createMember(data: {
    organizationId: string;
    userId: string;
    roleId: string;
    fullName: string;
    phone?: string;
    primaryWorkArea?: string;
    preferredLanguage?: string;
  }) {
    return this.prisma.organizationMember.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        roleId: data.roleId,
        fullName: data.fullName,
        phone: data.phone || '',
        primaryWorkArea: (data.primaryWorkArea as any) || 'PLATFORM',
        preferredLanguage: (data.preferredLanguage as any) || 'ENGLISH',
        status: 'ACTIVE',
      },

      include: {
        user: true,
        role: true,
      },
    });
  }

  async updateMember(memberId: string, orgId: string, data: Prisma.OrganizationMemberUpdateInput) {
    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data,
      include: { user: true, role: true },
    });
  }

  async deleteMember(memberId: string) {
    return this.prisma.organizationMember.delete({
      where: { id: memberId },
    });
  }

  async findMembershipByUserAndOrg(userId: string, orgId: string) {
    return this.prisma.organizationMember.findFirst({
      where: { userId, organizationId: orgId },
      include: { user: true, role: true },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async createUser(data: { email: string; phone?: string; status?: UserStatus; passwordHash?: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        status: data.status || 'ACTIVE',
        passwordHash: data.passwordHash || 'MANAGED_MEMBER_NO_PASSWORD',
      },
    });
  }


  // ============================================================================
  // 3. USERS
  // ============================================================================

  async findUsers(options: {
    status?: UserStatus;
    search?: string;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.UserWhereInput = {
      ...(options.status ? { status: options.status } : {}),
      ...(options.search
        ? {
            OR: [
              { email: { contains: options.search, mode: 'insensitive' } },
              { phone: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        select: {
          id: true,
          email: true,
          phone: true,
          status: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          organizationMembers: {
            include: {
              organization: { select: { id: true, publicId: true, name: true } },
              role: { select: { type: true, name: true } },
            },
          },
        },
      }),
    ]);

    return { total, items };
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizationMembers: {
          include: {
            organization: true,
            role: true,
          },
        },
        customers: true,
        providers: true,
        deliveryPartners: true,
      },
    });
  }


  async updateUserStatus(userId: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  // ============================================================================
  // 4. CUSTOMERS
  // ============================================================================

  async findCustomers(
    orgId: string,
    options: {
      status?: string;
      tier?: string;
      search?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.CustomerWhereInput = {
      organizationId: orgId,
      ...(options.status ? { status: options.status as any } : {}),
      ...(options.tier ? { membershipTier: options.tier as any } : {}),
      ...(options.search
        ? {
            OR: [
              { fullName: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
              { phone: { contains: options.search, mode: 'insensitive' } },
              { publicId: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderByField = options.sortBy === 'createdAt' ? 'joinedAt' : options.sortBy || 'joinedAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          user: { select: { email: true, status: true, lastLoginAt: true } },
          _count: { select: { bookings: true, reviews: true, supportTickets: true, disputes: true } },
        },
      }),
    ]);

    return { total, items };
  }

  async findCustomerById(customerId: string, orgId: string) {
    return this.prisma.customer.findFirst({
      where: { id: customerId, organizationId: orgId },
      include: {
        user: true,
        addresses: true,
        rewardAccount: true,
        _count: { select: { bookings: true, reviews: true, supportTickets: true, disputes: true } },
      },
    });
  }

  async updateCustomer(customerId: string, orgId: string, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data,
    });
  }

  async findCustomerBookings(customerId: string, orgId: string, options: { skip?: number; take?: number }) {
    const where: Prisma.BookingWhereInput = { customerId, organizationId: orgId };
    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
        include: { items: true, schedule: true, payment: true },
      }),
    ]);
    return { total, items };
  }


  async findCustomerPayments(customerId: string, orgId: string, options: { skip?: number; take?: number }) {
    const where: Prisma.PaymentWhereInput = {
      organizationId: orgId,
      booking: { customerId },
    };
    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, items };
  }

  async findCustomerAddresses(customerId: string) {
    return this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: { isDefault: 'desc' },
    });
  }

  // ============================================================================

  // 5. PROVIDERS
  // ============================================================================

  async findProviders(
    orgId: string,
    options: {
      status?: string;
      approvalStatus?: string;
      search?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.ProviderWhereInput = {
      organizationId: orgId,
      ...(options.status ? { status: options.status as any } : {}),
      ...(options.approvalStatus ? { approvalStatus: options.approvalStatus as any } : {}),
      ...(options.search
        ? {
            OR: [
              { businessName: { contains: options.search, mode: 'insensitive' } },
              { fullName: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
              { publicId: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.provider.count({ where }),
      this.prisma.provider.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          user: { select: { email: true, status: true, lastLoginAt: true } },
          _count: { select: { bookings: true, assignments: true, reviews: true, earnings: true } },
        },
      }),
    ]);

    return { total, items };
  }

  async findProviderById(providerId: string, orgId: string) {
    return this.prisma.provider.findFirst({
      where: { id: providerId, organizationId: orgId },
      include: {
        user: true,
        serviceAreas: true,
        availabilities: true,
        services: { include: { service: true } },
        _count: { select: { bookings: true, assignments: true, reviews: true, earnings: true } },
      },
    });
  }

  async updateProvider(providerId: string, orgId: string, data: Prisma.ProviderUpdateInput) {
    return this.prisma.provider.update({
      where: { id: providerId },
      data,
    });
  }

  // ============================================================================
  // 6. DELIVERY PARTNERS
  // ============================================================================

  async findDeliveryPartners(
    orgId: string,
    options: {
      status?: string;
      approvalStatus?: string;
      vehicleType?: string;
      search?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.DeliveryPartnerWhereInput = {
      organizationId: orgId,
      ...(options.status ? { status: options.status as any } : {}),
      ...(options.approvalStatus ? { approvalStatus: options.approvalStatus as any } : {}),
      ...(options.vehicleType ? { vehicleType: options.vehicleType as any } : {}),
      ...(options.search
        ? {
            OR: [
              { fullName: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
              { phone: { contains: options.search, mode: 'insensitive' } },
              { publicId: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.deliveryPartner.count({ where }),
      this.prisma.deliveryPartner.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          user: { select: { email: true, status: true, lastLoginAt: true } },
          _count: { select: { assignments: true, earnings: true } },
        },
      }),
    ]);

    return { total, items };
  }

  async findDeliveryPartnerById(valetId: string, orgId: string) {
    return this.prisma.deliveryPartner.findFirst({
      where: { id: valetId, organizationId: orgId },
      include: {
        user: true,
        serviceAreas: true,
        availabilities: true,
        _count: { select: { assignments: true, earnings: true } },
      },
    });
  }

  async updateDeliveryPartner(valetId: string, orgId: string, data: Prisma.DeliveryPartnerUpdateInput) {
    return this.prisma.deliveryPartner.update({
      where: { id: valetId },
      data,
    });
  }

  async findProviderServices(providerId: string) {
    return this.prisma.providerService.findMany({
      where: { providerId },
      include: { service: true },
    });
  }

  async findProviderBookings(providerId: string, orgId: string, options: { skip?: number; take?: number }) {
    const where: Prisma.BookingWhereInput = { providerId, organizationId: orgId };
    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
        include: { items: true, schedule: true, payment: true, customer: true },
      }),

    ]);
    return { total, items };
  }

  async findProviderEarnings(providerId: string, orgId: string, options: { skip?: number; take?: number }) {
    const where: Prisma.EarningWhereInput = { providerId, organizationId: orgId };
    const [total, items] = await Promise.all([
      this.prisma.earning.count({ where }),
      this.prisma.earning.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
        include: { booking: true },
      }),
    ]);
    return { total, items };
  }

  async findDeliveryPartnerAssignments(partnerId: string, orgId: string, options: { skip?: number; take?: number }) {
    const where: Prisma.BookingAssignmentWhereInput = {
      deliveryPartnerId: partnerId,
      booking: { organizationId: orgId },
    };
    const [total, items] = await Promise.all([
      this.prisma.bookingAssignment.count({ where }),
      this.prisma.bookingAssignment.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
        include: { booking: { include: { customer: true, address: true } } },
      }),
    ]);
    return { total, items };
  }

  async findDeliveryPartnerEarnings(partnerId: string, orgId: string, options: { skip?: number; take?: number }) {
    const where: Prisma.EarningWhereInput = { deliveryPartnerId: partnerId, organizationId: orgId };
    const [total, items] = await Promise.all([
      this.prisma.earning.count({ where }),
      this.prisma.earning.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
        include: { booking: true },
      }),
    ]);
    return { total, items };
  }

  // ============================================================================

  // 7. BOOKINGS
  // ============================================================================

  async findBookings(
    orgId: string,
    options: {
      bookingId?: string;
      customerId?: string;
      providerId?: string;
      deliveryPartnerId?: string;
      serviceId?: string;
      status?: BookingStatus;
      paymentStatus?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.BookingWhereInput = {
      organizationId: orgId,
      ...(options.bookingId
        ? { OR: [{ id: options.bookingId }, { bookingNumber: options.bookingId }] }
        : {}),
      ...(options.customerId ? { customerId: options.customerId } : {}),
      ...(options.providerId ? { providerId: options.providerId } : {}),
      ...(options.deliveryPartnerId
        ? { assignments: { some: { deliveryPartnerId: options.deliveryPartnerId } } }
        : {}),
      ...(options.serviceId ? { serviceId: options.serviceId } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.paymentStatus ? { payment: { status: options.paymentStatus as any } } : {}),
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
              { customer: { fullName: { contains: options.search, mode: 'insensitive' } } },
              { provider: { businessName: { contains: options.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          customer: { select: { id: true, publicId: true, fullName: true, phone: true } },
          provider: { select: { id: true, publicId: true, businessName: true } },
          service: { select: { id: true, publicId: true, name: true } },
          payment: { select: { id: true, publicId: true, amount: true, status: true, method: true } },
          items: true,
          address: true,
          schedule: true,
        },
      }),
    ]);

    return { total, items };
  }

  async findBookingById(bookingId: string, orgId: string) {
    return this.prisma.booking.findFirst({
      where: {
        organizationId: orgId,
        OR: [{ id: bookingId }, { bookingNumber: bookingId }],
      },
      include: {
        customer: true,
        provider: true,
        service: true,
        payment: { include: { refunds: true, transactions: true } },
        items: true,
        address: true,
        schedule: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        assignments: { include: { provider: true, deliveryPartner: true } },
        supportTickets: true,
        disputes: true,
      },
    });
  }

  async cancelBooking(bookingId: string, orgId: string, reason: string, cancelledByUserId: string) {

    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, organizationId: orgId } });
    if (!booking) return null;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          organizationId: orgId,
          fromStatus: booking.status,
          toStatus: 'CANCELLED',
          changedByUserId: cancelledByUserId,
          reason,
        },
      });

      return updated;
    });
  }

  async rescheduleBooking(
    bookingId: string,
    orgId: string,
    newScheduledAt: Date,
    timeSlot: string,
    reason: string,
    rescheduledByUserId: string,
  ) {
    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, organizationId: orgId } });
    if (!booking) return null;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          scheduledAt: newScheduledAt,
          schedule: {
            upsert: {
              create: {
                organizationId: orgId,
                pickupDate: newScheduledAt,
                pickupTimeSlot: timeSlot,
              },
              update: {
                pickupDate: newScheduledAt,
                pickupTimeSlot: timeSlot,
              },
            },
          },
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          organizationId: orgId,
          fromStatus: booking.status,
          toStatus: booking.status,
          changedByUserId: rescheduledByUserId,
          reason: `Rescheduled: ${reason} (New slot: ${timeSlot})`,
        },
      });

      return updated;
    });
  }

  async createBookingNote(data: {
    bookingId: string;
    organizationId: string;
    authorUserId: string;
    note: string;
    isInternalOnly?: boolean;
  }) {
    return this.prisma.bookingNote.create({
      data: {
        bookingId: data.bookingId,
        organizationId: data.organizationId,
        authorUserId: data.authorUserId,
        note: data.note,
        isInternalOnly: data.isInternalOnly ?? true,
      },
      include: {
        booking: { select: { id: true, bookingNumber: true } },
      },
    });
  }

  async findBookingAssignments(bookingId: string, orgId: string) {
    return this.prisma.bookingAssignment.findMany({
      where: { bookingId, booking: { organizationId: orgId } },
      include: { provider: true, deliveryPartner: true, history: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBookingPayments(bookingId: string, orgId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId, organizationId: orgId },
      include: { refunds: true, transactions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBookingStatusHistory(bookingId: string, orgId: string) {
    return this.prisma.bookingStatusHistory.findMany({
      where: { bookingId, organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================================

  // 8. ASSIGNMENTS
  // ============================================================================

  async findAssignments(
    orgId: string,
    options: {
      bookingId?: string;
      providerId?: string;
      deliveryPartnerId?: string;
      status?: string;
      type?: any;
      role?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.BookingAssignmentWhereInput = {
      organizationId: orgId,
      ...(options.bookingId ? { bookingId: options.bookingId } : {}),
      ...(options.providerId ? { providerId: options.providerId } : {}),
      ...(options.deliveryPartnerId ? { deliveryPartnerId: options.deliveryPartnerId } : {}),
      ...(options.status ? { status: options.status as any } : {}),
      ...(options.type ? { type: options.type as any } : options.role ? { type: options.role as any } : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.bookingAssignment.count({ where }),
      this.prisma.bookingAssignment.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          booking: { select: { id: true, bookingNumber: true, status: true, scheduledAt: true } },
          provider: { select: { id: true, publicId: true, businessName: true } },
          deliveryPartner: { select: { id: true, publicId: true, fullName: true } },
        },
      }),
    ]);

    return { total, items };
  }

  async findAssignmentById(assignmentId: string, orgId: string) {
    return this.prisma.bookingAssignment.findFirst({
      where: {
        organizationId: orgId,
        OR: [{ id: assignmentId }, { publicId: assignmentId }],
      },
      include: {
        booking: { include: { address: true, schedule: true } },
        provider: true,
        deliveryPartner: true,
        history: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async reassignAssignment(
    assignmentId: string,
    orgId: string,
    params: {
      providerId?: string;
      deliveryPartnerId?: string;
      reason: string;
      actorUserId: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bookingAssignment.update({
        where: { id: assignmentId },
        data: {
          providerId: params.providerId,
          deliveryPartnerId: params.deliveryPartnerId,
          status: 'ASSIGNED',
        },
      });

      await tx.assignmentHistory.create({
        data: {
          assignmentId,
          organizationId: orgId,
          action: 'REASSIGNED',
          actorUserId: params.actorUserId,
          details: `Reassigned: ${params.reason}`,
        },
      });

      return updated;
    });
  }

  async cancelAssignment(
    assignmentId: string,
    orgId: string,
    params: {
      reason: string;
      actorUserId: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bookingAssignment.update({
        where: { id: assignmentId },
        data: {
          status: 'CANCELLED',
        },
      });

      await tx.assignmentHistory.create({
        data: {
          assignmentId,
          organizationId: orgId,
          action: 'CANCELLED',
          actorUserId: params.actorUserId,
          details: `Cancelled by admin: ${params.reason}`,
        },
      });

      return updated;
    });
  }

  // ============================================================================

  // 9. FINANCIAL
  // ============================================================================

  async findPayments(
    orgId: string,
    options: {
      bookingId?: string;
      status?: string;
      gatewayName?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.PaymentWhereInput = {
      organizationId: orgId,
      ...(options.bookingId ? { bookingId: options.bookingId } : {}),
      ...(options.status ? { status: options.status as any } : {}),
      ...(options.gatewayName ? { gatewayName: options.gatewayName } : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          booking: { select: { id: true, bookingNumber: true, totalAmount: true } },
          refunds: true,
        },
      }),
    ]);

    return { total, items };
  }

  async findPaymentById(paymentId: string, orgId: string) {
    return this.prisma.payment.findFirst({
      where: {
        organizationId: orgId,
        OR: [{ id: paymentId }, { publicId: paymentId }],
      },
      include: {
        booking: { include: { customer: true, provider: true } },
        refunds: true,
        transactions: true,
      },
    });
  }

  async overridePaymentStatus(paymentId: string, orgId: string, status: PaymentStatus, reason?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { organizationId: orgId, OR: [{ id: paymentId }, { publicId: paymentId }] },
    });
    if (!payment) return null;

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        failureReason: status === 'FAILED' ? reason : undefined,
      },
    });
  }


  async findTransactions(
    orgId: string,
    options: {
      bookingId?: string;
      paymentId?: string;
      type?: string;
      status?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.TransactionWhereInput = {
      organizationId: orgId,
      ...(options.bookingId ? { bookingId: options.bookingId } : {}),
      ...(options.paymentId ? { paymentId: options.paymentId } : {}),
      ...(options.type ? { type: options.type as any } : {}),
      ...(options.status ? { status: options.status as any } : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          payment: { select: { publicId: true, method: true } },
          booking: { select: { bookingNumber: true } },
        },
      }),
    ]);

    return { total, items };
  }

  async findTransactionById(transactionId: string, orgId: string) {
    return this.prisma.transaction.findFirst({
      where: {
        organizationId: orgId,
        OR: [{ id: transactionId }, { publicId: transactionId }],
      },
      include: { payment: true, booking: true },
    });
  }

  async findRefunds(
    orgId: string,
    options: {
      paymentId?: string;
      status?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.RefundWhereInput = {
      organizationId: orgId,
      ...(options.paymentId ? { paymentId: options.paymentId } : {}),
      ...(options.status ? { status: options.status as any } : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.refund.count({ where }),
      this.prisma.refund.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          payment: { select: { publicId: true, amount: true, booking: { select: { bookingNumber: true } } } },
        },
      }),
    ]);

    return { total, items };
  }

  async findRefundById(refundId: string, orgId: string) {
    return this.prisma.refund.findFirst({
      where: {
        organizationId: orgId,
        OR: [{ id: refundId }, { publicId: refundId }],
      },
      include: {
        payment: { include: { booking: true } },
      },
    });
  }

  async findEarnings(
    orgId: string,
    options: {
      providerId?: string;
      deliveryPartnerId?: string;
      status?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.EarningWhereInput = {
      organizationId: orgId,
      ...(options.providerId ? { providerId: options.providerId } : {}),
      ...(options.deliveryPartnerId ? { deliveryPartnerId: options.deliveryPartnerId } : {}),
      ...(options.status ? { status: options.status as any } : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.earning.count({ where }),
      this.prisma.earning.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          provider: { select: { publicId: true, businessName: true } },
          deliveryPartner: { select: { publicId: true, fullName: true } },
          booking: { select: { bookingNumber: true } },
        },
      }),
    ]);

    return { total, items };
  }

  async findEarningById(earningId: string, orgId: string) {
    return this.prisma.earning.findFirst({
      where: {
        organizationId: orgId,
        OR: [{ id: earningId }, { publicId: earningId }],
      },
      include: {
        provider: true,
        deliveryPartner: true,
        booking: true,
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  // ============================================================================
  // 10. DASHBOARD METRICS
  // ============================================================================

  async getDashboardMetrics(orgId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalBookings,
      todayBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      unassignedBookings,
      activeAssignments,
      paymentsPaid,
      paymentsPending,
      paymentsFailed,
      openTickets,
      urgentTickets,
      escalatedTickets,
      openDisputes,
      underReviewDisputes,
      escalatedDisputes,
      activeProviders,
      suspendedProviders,
      activeValets,
      suspendedValets,
      pendingReviews,
    ] = await Promise.all([
      this.prisma.booking.count({ where: { organizationId: orgId } }),
      this.prisma.booking.count({ where: { organizationId: orgId, createdAt: { gte: todayStart } } }),
      this.prisma.booking.count({ where: { organizationId: orgId, status: BookingStatus.PENDING } }),
      this.prisma.booking.count({
        where: {
          organizationId: orgId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
        },
      }),
      this.prisma.booking.count({ where: { organizationId: orgId, status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({ where: { organizationId: orgId, status: BookingStatus.CANCELLED } }),
      this.prisma.booking.count({
        where: {
          organizationId: orgId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          assignments: { none: {} },
        },
      }),
      this.prisma.bookingAssignment.count({
        where: {
          organizationId: orgId,
          status: { in: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'] as any },
        },
      }),
      this.prisma.payment.count({ where: { organizationId: orgId, status: 'PAID' } }),
      this.prisma.payment.count({ where: { organizationId: orgId, status: 'PENDING' } }),
      this.prisma.payment.count({ where: { organizationId: orgId, status: 'FAILED' } }),
      this.prisma.supportTicket.count({
        where: { organizationId: orgId, status: { in: ['OPEN', 'IN_PROGRESS'] as any } },
      }),
      this.prisma.supportTicket.count({
        where: { organizationId: orgId, priority: 'URGENT', status: { notIn: ['RESOLVED', 'CLOSED'] as any } },
      }),
      this.prisma.supportTicket.count({
        where: { organizationId: orgId, status: 'ESCALATED' as any },
      }),
      this.prisma.dispute.count({
        where: { organizationId: orgId, status: 'FILED' as any },
      }),
      this.prisma.dispute.count({
        where: { organizationId: orgId, status: 'UNDER_REVIEW' as any },
      }),
      this.prisma.dispute.count({
        where: { organizationId: orgId, status: 'ESCALATED' as any },
      }),
      this.prisma.provider.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
      this.prisma.provider.count({ where: { organizationId: orgId, status: 'SUSPENDED' } }),
      this.prisma.deliveryPartner.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
      this.prisma.deliveryPartner.count({ where: { organizationId: orgId, status: 'SUSPENDED' } }),
      this.prisma.review.count({ where: { organizationId: orgId, status: 'SUBMITTED' as any } }),
    ]);

    return {
      bookings: {
        total: totalBookings,
        today: todayBookings,
        pending: pendingBookings,
        active: activeBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      assignments: {
        unassigned: unassignedBookings,
        active: activeAssignments,
      },
      payments: {
        successful: paymentsPaid,
        pending: paymentsPending,
        failed: paymentsFailed,
      },
      support: {
        open: openTickets,
        urgent: urgentTickets,
        escalated: escalatedTickets,
      },
      disputes: {
        open: openDisputes,
        underReview: underReviewDisputes,
        escalated: escalatedDisputes,
      },
      providers: {
        active: activeProviders,
        suspended: suspendedProviders,
      },
      deliveryPartners: {
        active: activeValets,
        suspended: suspendedValets,
      },
      reviews: {
        pendingModeration: pendingReviews,
      },
    };
  }

  // ============================================================================
  // 11. GLOBAL SEARCH
  // ============================================================================

  async globalSearch(orgId: string, q: string) {
    const term = q.trim();
    if (!term) {
      return {
        customers: [],
        providers: [],
        deliveryPartners: [],
        bookings: [],
        services: [],
        payments: [],
        supportTickets: [],
        disputes: [],
        reviews: [],
      };
    }

    const [
      customers,
      providers,
      deliveryPartners,
      bookings,
      services,
      payments,
      supportTickets,
      disputes,
      reviews,
    ] = await Promise.all([
      this.prisma.customer.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { fullName: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
            { publicId: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, publicId: true, fullName: true, email: true, phone: true },
      }),
      this.prisma.provider.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { businessName: { contains: term, mode: 'insensitive' } },
            { fullName: { contains: term, mode: 'insensitive' } },
            { publicId: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, publicId: true, businessName: true, fullName: true, city: true },
      }),
      this.prisma.deliveryPartner.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { fullName: { contains: term, mode: 'insensitive' } },
            { publicId: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, publicId: true, fullName: true, vehicleType: true, phone: true },
      }),
      this.prisma.booking.findMany({
        where: {
          organizationId: orgId,
          bookingNumber: { contains: term, mode: 'insensitive' },
        },
        take: 5,
        select: { id: true, bookingNumber: true, status: true, totalAmount: true, scheduledAt: true },
      }),
      this.prisma.service.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { slug: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, publicId: true, name: true, basePrice: true, status: true },
      }),
      this.prisma.payment.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { publicId: { contains: term, mode: 'insensitive' } },
            { gatewayRef: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, publicId: true, amount: true, status: true, method: true },
      }),
      this.prisma.supportTicket.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { publicId: { contains: term, mode: 'insensitive' } },
            { subject: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, publicId: true, subject: true, status: true, priority: true },
      }),
      this.prisma.dispute.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { publicId: { contains: term, mode: 'insensitive' } },
            { reason: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, publicId: true, reason: true, status: true, priority: true },
      }),
      this.prisma.review.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { publicId: { contains: term, mode: 'insensitive' } },
            { comment: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, publicId: true, rating: true, status: true, comment: true },
      }),
    ]);

    return {
      customers,
      providers,
      deliveryPartners,
      bookings,
      services,
      payments,
      supportTickets,
      disputes,
      reviews,
    };
  }

  // ============================================================================
  // 12. AUDIT LOGS
  // ============================================================================

  async createAuditEvent(data: {
    organizationId?: string;
    actorUserId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadataJson?: Record<string, any>;
    ipHash?: string | null;
  }) {
    return this.prisma.auditEvent.create({
      data: {
        organizationId: data.organizationId,
        actorUserId: data.actorUserId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadataJson: data.metadataJson ?? Prisma.DbNull,
        ipHash: data.ipHash,
      },
    });
  }

  async findAuditEvents(
    orgId: string,
    options: {
      actorUserId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      dateFrom?: string;
      dateTo?: string;
      skip?: number;
      take?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const where: Prisma.AuditEventWhereInput = {
      organizationId: orgId,
      ...(options.actorUserId ? { actorUserId: options.actorUserId } : {}),
      ...(options.action ? { action: options.action } : {}),
      ...(options.entityType ? { entityType: options.entityType } : {}),
      ...(options.entityId ? { entityId: options.entityId } : {}),
      ...(options.dateFrom || options.dateTo
        ? {
            createdAt: {
              ...(options.dateFrom ? { gte: new Date(options.dateFrom) } : {}),
              ...(options.dateTo ? { lte: new Date(options.dateTo) } : {}),
            },
          }
        : {}),
    };

    const orderByField = options.sortBy || 'createdAt';
    const orderBy = { [orderByField]: options.sortOrder || 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.auditEvent.count({ where }),
      this.prisma.auditEvent.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          actorUser: { select: { email: true } },
        },
      }),
    ]);

    return { total, items };
  }

  async findAuditEventById(auditEventId: string, orgId: string) {
    return this.prisma.auditEvent.findFirst({
      where: {
        id: auditEventId,
        organizationId: orgId,
      },
      include: {
        actorUser: { select: { id: true, email: true } },
      },
    });
  }

  // ============================================================================
  // 13. REPORTING
  // ============================================================================

  async getBookingReport(orgId: string, dateFrom?: string, dateTo?: string) {
    const where: Prisma.BookingWhereInput = {
      organizationId: orgId,
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    };

    const bookings = await this.prisma.booking.findMany({
      where,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const byStatus: Record<string, number> = {};
    for (const b of bookings) {
      byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    }

    return {
      totalBookings: bookings.length,
      byStatus,
      bookingsSample: bookings.slice(0, 100),
    };
  }

  async getRevenueReport(orgId: string, dateFrom?: string, dateTo?: string) {
    const where: Prisma.PaymentWhereInput = {
      organizationId: orgId,
      status: 'PAID',
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    };

    const payments = await this.prisma.payment.findMany({
      where,
      select: {
        amount: true,
        method: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    let totalRevenue = 0;
    const byMethod: Record<string, number> = {};
    for (const p of payments) {
      const amt = Number(p.amount) || 0;
      totalRevenue += amt;
      byMethod[p.method] = (byMethod[p.method] || 0) + amt;
    }

    return {
      totalRevenue,
      paymentCount: payments.length,
      byMethod,
    };
  }

  async getProviderPerformanceReport(orgId: string) {
    return this.prisma.provider.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        businessName: true,
        rating: true,
        status: true,
        _count: { select: { bookings: true, reviews: true, earnings: true } },
      },
      orderBy: { rating: 'desc' },
      take: 50,
    });
  }

  async getCustomerAcquisitionReport(orgId: string, dateFrom?: string, dateTo?: string) {
    const where: Prisma.CustomerWhereInput = {
      organizationId: orgId,
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    };

    const count = await this.prisma.customer.count({ where });
    const customers = await this.prisma.customer.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        membershipTier: true,
        joinedAt: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { joinedAt: 'desc' },
      take: 50,
    });

    return { totalNewCustomers: count, sample: customers };
  }

  async findNotifications(orgId: string, query?: { page?: number; limit?: number; status?: any; type?: any }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = { organizationId: orgId };
    if (query?.status) where.status = query.status;
    if (query?.type) where.type = query.type;

    const [total, items] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, items, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findNotificationById(notificationId: string, orgId: string) {
    return this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        organizationId: orgId,
      },
      include: {
        recipientUser: {
          select: { id: true, email: true, phone: true },
        },
      },
    });
  }
}


