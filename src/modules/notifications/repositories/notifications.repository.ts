import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  CommunicationChannel,
  CommunicationStatus,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
  RecipientType,
} from '../types/notifications.types';
import {
  CommunicationListQueryDto,
  NotificationListQueryDto,
  NotificationTemplateListQueryDto,
} from '../dto';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // 1. PUBLIC ID GENERATORS
  // ============================================================================

  async generateNotificationPublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.notification.count({
      where: { organizationId },
    });
    const seq = String(count + 1).padStart(6, '0');
    return `NOT-${year}-${seq}`;
  }

  async generateTemplatePublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.notificationTemplate.count({
      where: { organizationId },
    });
    const seq = String(count + 1).padStart(6, '0');
    return `TMP-${year}-${seq}`;
  }

  async generateCommunicationPublicId(organizationId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.communication.count({
      where: { organizationId },
    });
    const seq = String(count + 1).padStart(6, '0');
    return `COM-${year}-${seq}`;
  }

  // ============================================================================
  // 2. NOTIFICATIONS QUERIES & MUTATIONS
  // ============================================================================

  async findNotificationsByUser(
    organizationId: string,
    recipientUserId: string,
    query: NotificationListQueryDto,
  ) {
    const { status, type, priority, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      organizationId,
      recipientUserId,
      ...(status && { status }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countUnreadNotifications(
    organizationId: string,
    recipientUserId: string,
  ) {
    const [unreadCount, criticalCount, highCount] = await Promise.all([
      this.prisma.notification.count({
        where: { organizationId, recipientUserId, status: NotificationStatus.UNREAD },
      }),
      this.prisma.notification.count({
        where: {
          organizationId,
          recipientUserId,
          status: NotificationStatus.UNREAD,
          priority: NotificationPriority.CRITICAL,
        },
      }),
      this.prisma.notification.count({
        where: {
          organizationId,
          recipientUserId,
          status: NotificationStatus.UNREAD,
          priority: NotificationPriority.HIGH,
        },
      }),
    ]);

    return {
      unreadCount,
      criticalCount,
      highCount,
    };
  }

  async findNotificationById(
    organizationId: string,
    notificationIdentifier: string,
  ) {
    return this.prisma.notification.findFirst({
      where: {
        organizationId,
        OR: [
          { id: notificationIdentifier.length === 36 ? notificationIdentifier : undefined },
          { publicId: notificationIdentifier },
        ],
      },
    });
  }

  async createNotification(data: {
    organizationId: string;
    recipientUserId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    status?: NotificationStatus;
    linkUrl?: string | null;
    data?: any;
  }) {
    const publicId = await this.generateNotificationPublicId(data.organizationId);

    return this.prisma.notification.create({
      data: {
        publicId,
        organizationId: data.organizationId,
        recipientUserId: data.recipientUserId,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority ?? NotificationPriority.MEDIUM,
        status: data.status ?? NotificationStatus.UNREAD,
        linkUrl: data.linkUrl ?? null,
        data: data.data ?? undefined,
      },
    });
  }

  async markNotificationAsRead(
    organizationId: string,
    notificationId: string,
    userId: string,
  ) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        organizationId,
        recipientUserId: userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async markAllNotificationsAsRead(organizationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        organizationId,
        recipientUserId: userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async archiveNotification(
    organizationId: string,
    notificationId: string,
    userId: string,
  ) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        organizationId,
        recipientUserId: userId,
      },
      data: {
        status: NotificationStatus.ARCHIVED,
      },
    });
  }

  // ============================================================================
  // 3. PREFERENCES QUERIES & MUTATIONS
  // ============================================================================

  async getPreferences(organizationId: string, userId: string) {
    let pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await this.prisma.notificationPreference.create({
        data: {
          userId,
          organizationId,
          inAppEnabled: true,
          emailEnabled: true,
          smsEnabled: false,
          whatsappEnabled: true,
          pushEnabled: true,
          orderUpdates: true,
          marketingOffers: true,
          systemAlerts: true,
          categories: {
            BOOKING: true,
            ASSIGNMENT: true,
            PAYMENT: true,
            EARNINGS: true,
            PROMOTIONS: true,
            REVIEWS: true,
            SECURITY: true,
            SYSTEM: true,
          },
        },
      });
    }

    return pref;
  }

  async upsertPreferences(
    organizationId: string,
    userId: string,
    data: {
      inAppEnabled?: boolean;
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      whatsappEnabled?: boolean;
      pushEnabled?: boolean;
      orderUpdates?: boolean;
      marketingOffers?: boolean;
      systemAlerts?: boolean;
      categories?: Record<string, boolean>;
    },
  ) {
    const existing = await this.getPreferences(organizationId, userId);

    const mergedCategories = {
      ...(typeof existing.categories === 'object' && existing.categories !== null
        ? (existing.categories as Record<string, boolean>)
        : {}),
      ...(data.categories || {}),
      SECURITY: true, // Always enforced
      SYSTEM: true,   // Always enforced
    };

    return this.prisma.notificationPreference.update({
      where: { userId },
      data: {
        inAppEnabled: data.inAppEnabled ?? existing.inAppEnabled,
        emailEnabled: data.emailEnabled ?? existing.emailEnabled,
        smsEnabled: data.smsEnabled ?? existing.smsEnabled,
        whatsappEnabled: data.whatsappEnabled ?? existing.whatsappEnabled,
        pushEnabled: data.pushEnabled ?? existing.pushEnabled,
        orderUpdates: data.orderUpdates ?? existing.orderUpdates,
        marketingOffers: data.marketingOffers ?? existing.marketingOffers,
        systemAlerts: true, // System alerts always bypass
        categories: mergedCategories,
      },
    });
  }

  // ============================================================================
  // 4. TEMPLATES QUERIES & MUTATIONS
  // ============================================================================

  async findTemplates(
    organizationId: string,
    query: NotificationTemplateListQueryDto,
  ) {
    const { type, channel, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationTemplateWhereInput = {
      organizationId,
      ...(type && { type }),
      ...(channel && { channel }),
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.notificationTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ type: 'asc' }, { version: 'desc' }],
      }),
      this.prisma.notificationTemplate.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findTemplateById(
    organizationId: string,
    templateIdentifier: string,
  ) {
    return this.prisma.notificationTemplate.findFirst({
      where: {
        organizationId,
        OR: [
          { id: templateIdentifier.length === 36 ? templateIdentifier : undefined },
          { publicId: templateIdentifier },
        ],
      },
    });
  }

  async findActiveTemplate(
    organizationId: string,
    type: string,
    channel: CommunicationChannel,
  ) {
    return this.prisma.notificationTemplate.findFirst({
      where: {
        organizationId,
        type,
        channel,
        status: 'ACTIVE',
      },
      orderBy: { version: 'desc' },
    });
  }

  async findLatestTemplateVersion(
    organizationId: string,
    type: string,
    channel: CommunicationChannel,
  ): Promise<number> {
    const latest = await this.prisma.notificationTemplate.findFirst({
      where: {
        organizationId,
        type,
        channel,
      },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    return latest?.version ?? 0;
  }

  async createTemplate(data: {
    organizationId: string;
    type: string;
    channel: CommunicationChannel;
    subject?: string;
    titleTemplate: string;
    bodyTemplate: string;
    version?: number;
    status?: string;
  }) {
    const publicId = await this.generateTemplatePublicId(data.organizationId);
    const version =
      data.version ??
      ((await this.findLatestTemplateVersion(data.organizationId, data.type, data.channel)) + 1);

    return this.prisma.notificationTemplate.create({
      data: {
        publicId,
        organizationId: data.organizationId,
        type: data.type,
        channel: data.channel,
        subject: data.subject ?? null,
        titleTemplate: data.titleTemplate,
        bodyTemplate: data.bodyTemplate,
        version,
        status: data.status ?? 'ACTIVE',
      },
    });
  }

  async updateTemplate(
    organizationId: string,
    templateId: string,
    data: {
      subject?: string;
      titleTemplate?: string;
      bodyTemplate?: string;
      status?: string;
    },
  ) {
    return this.prisma.notificationTemplate.update({
      where: { id: templateId },
      data: {
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.titleTemplate !== undefined && { titleTemplate: data.titleTemplate }),
        ...(data.bodyTemplate !== undefined && { bodyTemplate: data.bodyTemplate }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
  }

  // ============================================================================
  // 5. COMMUNICATIONS QUERIES & MUTATIONS
  // ============================================================================

  async findCommunications(
    organizationId: string,
    query: CommunicationListQueryDto,
  ) {
    const { channel, status, type, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CommunicationWhereInput = {
      organizationId,
      ...(channel && { channel }),
      ...(status && { status }),
      ...(type && { type }),
    };

    const [items, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        skip,
        take: limit,
        include: {
          recipients: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communication.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCommunicationById(
    organizationId: string,
    communicationIdentifier: string,
  ) {
    return this.prisma.communication.findFirst({
      where: {
        organizationId,
        OR: [
          { id: communicationIdentifier.length === 36 ? communicationIdentifier : undefined },
          { publicId: communicationIdentifier },
        ],
      },
      include: {
        recipients: true,
        senderUser: {
          select: { id: true, email: true },
        },
      },
    });
  }

  async createCommunicationWithRecipients(data: {
    organizationId: string;
    senderUserId: string;
    notificationId?: string | null;
    channel: CommunicationChannel;
    type?: string;
    subject: string;
    body: string;
    content?: string | null;
    status?: CommunicationStatus;
    provider?: string;
    providerMessageId?: string;
    recipients: Array<{
      recipientType: RecipientType;
      recipientId?: string | null;
      userId?: string | null;
      channelAddress?: string | null;
      status?: CommunicationStatus;
    }>;
  }) {
    const publicId = await this.generateCommunicationPublicId(data.organizationId);

    return this.prisma.communication.create({
      data: {
        publicId,
        organizationId: data.organizationId,
        senderUserId: data.senderUserId,
        notificationId: data.notificationId ?? null,
        channel: data.channel,
        type: data.type ?? 'TRANSACTIONAL',
        subject: data.subject,
        body: data.body,
        content: data.content ?? null,
        status: data.status ?? CommunicationStatus.SENT,
        provider: data.provider ?? 'MOCK',
        providerMessageId: data.providerMessageId ?? null,
        attemptCount: 1,
        lastAttemptAt: new Date(),
        sentAt: data.status === CommunicationStatus.SENT ? new Date() : null,
        recipients: {
          create: data.recipients.map((r) => ({
            organizationId: data.organizationId,
            recipientType: r.recipientType,
            recipientId: r.recipientId ?? null,
            userId: r.userId ?? null,
            channelAddress: r.channelAddress ?? null,
            status: r.status ?? CommunicationStatus.SENT,
            deliveredAt: r.status === CommunicationStatus.DELIVERED ? new Date() : null,
          })),
        },
      },
      include: {
        recipients: true,
      },
    });
  }

  async updateCommunicationStatus(
    organizationId: string,
    communicationId: string,
    status: CommunicationStatus,
    details?: {
      provider?: string;
      providerMessageId?: string;
      failureReason?: string;
      sentAt?: Date;
    },
  ) {
    return this.prisma.communication.updateMany({
      where: { id: communicationId, organizationId },
      data: {
        status,
        ...(details?.provider && { provider: details.provider }),
        ...(details?.providerMessageId && { providerMessageId: details.providerMessageId }),
        ...(details?.failureReason !== undefined && { failureReason: details.failureReason }),
        ...(details?.sentAt && { sentAt: details.sentAt }),
        ...(status === CommunicationStatus.FAILED && { failedAt: new Date() }),
      },
    });
  }

  async incrementCommunicationAttempt(
    organizationId: string,
    communicationId: string,
    status: CommunicationStatus,
    details?: {
      providerMessageId?: string;
      failureReason?: string;
    },
  ) {
    const comm = await this.prisma.communication.findUnique({
      where: { id: communicationId },
      select: { attemptCount: true },
    });

    const attemptCount = (comm?.attemptCount ?? 0) + 1;

    return this.prisma.communication.update({
      where: { id: communicationId },
      data: {
        attemptCount,
        status,
        lastAttemptAt: new Date(),
        providerMessageId: details?.providerMessageId ?? undefined,
        failureReason: details?.failureReason ?? null,
        failedAt: status === CommunicationStatus.FAILED ? new Date() : null,
        sentAt: status === CommunicationStatus.SENT ? new Date() : undefined,
      },
      include: {
        recipients: true,
      },
    });
  }

  // ============================================================================
  // 6. BROADCAST RECIPIENT RESOLUTION
  // ============================================================================

  async findUserIdsByRecipientType(
    organizationId: string,
    recipientType: RecipientType,
  ): Promise<string[]> {
    if (recipientType === RecipientType.ALL) {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { organizationMembers: { some: { organizationId } } },
            { customers: { some: { organizationId } } },
            { providers: { some: { organizationId } } },
            { deliveryPartners: { some: { organizationId } } },
          ],
        },
        select: { id: true },
      });
      return users.map((u) => u.id);
    }

    if (recipientType === RecipientType.CUSTOMER) {
      const customers = await this.prisma.customer.findMany({
        where: { organizationId },
        select: { userId: true },
      });
      return customers.map((c) => c.userId);
    }

    if (recipientType === RecipientType.PROVIDER) {
      const providers = await this.prisma.provider.findMany({
        where: { organizationId },
        select: { userId: true },
      });
      return providers.map((p) => p.userId);
    }

    if (recipientType === RecipientType.DELIVERY_PARTNER) {
      const delivery = await this.prisma.deliveryPartner.findMany({
        where: { organizationId },
        select: { userId: true },
      });
      return delivery.map((d) => d.userId);
    }

    if (recipientType === RecipientType.STAFF) {
      const members = await this.prisma.organizationMember.findMany({
        where: { organizationId },
        select: { userId: true },
      });
      return members.map((m) => m.userId);
    }

    return [];
  }

  async createNotificationsBatch(
    organizationId: string,
    recipientUserIds: string[],
    notificationData: {
      type: NotificationType;
      title: string;
      message: string;
      priority: NotificationPriority;
      linkUrl?: string;
    },
    chunkSize = 100,
  ): Promise<number> {
    const year = new Date().getFullYear();
    let totalCreated = 0;

    for (let i = 0; i < recipientUserIds.length; i += chunkSize) {
      const chunk = recipientUserIds.slice(i, i + chunkSize);
      const startCount = await this.prisma.notification.count({ where: { organizationId } });

      const records = chunk.map((userId, idx) => {
        const seq = String(startCount + idx + 1).padStart(6, '0');
        return {
          publicId: `NOT-${year}-${seq}`,
          organizationId,
          recipientUserId: userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          priority: notificationData.priority,
          status: NotificationStatus.UNREAD,
          linkUrl: notificationData.linkUrl ?? null,
        };
      });

      await this.prisma.notification.createMany({
        data: records,
        skipDuplicates: true,
      });

      totalCreated += chunk.length;
    }

    return totalCreated;
  }

  // ============================================================================
  // 7. EVENT LOGS (IDEMPOTENCY & DEDUPLICATION)
  // ============================================================================

  async findEventLog(eventId: string) {
    return this.prisma.notificationEventLog.findUnique({
      where: { eventId },
    });
  }

  async createEventLog(data: {
    eventId: string;
    organizationId: string;
    eventType: string;
    resourceType: string;
    resourceId: string;
    payload: any;
  }) {
    return this.prisma.notificationEventLog.create({
      data: {
        eventId: data.eventId,
        organizationId: data.organizationId,
        eventType: data.eventType,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        payload: data.payload,
      },
    });
  }

  // ============================================================================
  // 8. AUDIT LOGGING
  // ============================================================================

  async recordAuditEvent(
    organizationId: string,
    actorUserId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    metadataJson: Record<string, any>,
  ) {
    // Sanitize metadata to guarantee zero secret leaks
    const sanitized = { ...metadataJson };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.authorization;
    delete sanitized.apiKey;

    return this.prisma.auditEvent.create({
      data: {
        organizationId,
        actorUserId: actorUserId ?? undefined,
        action,
        entityType,
        entityId,
        metadataJson: sanitized,
      },
    });
  }
}
