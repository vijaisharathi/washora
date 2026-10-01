import { Injectable } from '@nestjs/common';
import {
  CatalogStatus,
  DocumentVerificationStatus,
  Prisma,
  Provider,
  ProviderAvailability,
  ProviderDocument,
  ProviderService,
  ProviderServiceArea,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find provider by user ID and organization ID.
   */
  async findProviderByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<Provider | null> {
    return this.prisma.provider.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  /**
   * Find provider by UUID or public ID within organization.
   */
  async findProviderByIdOrPublicId(
    identifier: string,
    organizationId: string,
  ): Promise<Provider | null> {
    return this.prisma.provider.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
    });
  }

  /**
   * Update provider profile details.
   */
  async updateProviderProfile(
    providerId: string,
    organizationId: string,
    data: {
      fullName?: string;
      businessName?: string;
      description?: string;
      phone?: string;
      city?: string;
      address?: string;
      profileImageUrl?: string;
      coverImageUrl?: string;
    },
  ): Promise<Provider> {
    return this.prisma.provider.update({
      where: { id: providerId },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.businessName !== undefined ? { businessName: data.businessName } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.profileImageUrl !== undefined ? { profileImageUrl: data.profileImageUrl } : {}),
        ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl } : {}),
      },
    });
  }

  /**
   * Find catalog service by UUID or public ID within organization.
   */
  async findCatalogServiceByIdOrPublicId(
    identifier: string,
    organizationId: string,
  ) {
    return this.prisma.service.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
    });
  }

  /**
   * List provider's configured services.
   */
  async findProviderServices(
    providerId: string,
    organizationId: string,
    status?: CatalogStatus,
    skip?: number,
    take?: number,
    search?: string,
  ) {
    return this.prisma.providerService.findMany({
      where: {
        providerId,
        organizationId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              service: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }
          : {}),
      },
      include: {
        service: {
          select: {
            id: true,
            publicId: true,
            name: true,
            slug: true,
            tagline: true,
            basePrice: true,
            unit: true,
            turnaroundHours: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Count total provider services.
   */
  async countProviderServices(
    providerId: string,
    organizationId: string,
    status?: CatalogStatus,
    search?: string,
  ): Promise<number> {
    return this.prisma.providerService.count({
      where: {
        providerId,
        organizationId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              service: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            }
          : {}),
      },
    });
  }

  /**
   * Find a specific provider service configuration.
   */
  async findProviderService(
    providerId: string,
    organizationId: string,
    serviceId: string,
  ) {
    return this.prisma.providerService.findFirst({
      where: {
        providerId,
        organizationId,
        serviceId,
      },
      include: {
        service: {
          select: {
            id: true,
            publicId: true,
            name: true,
            slug: true,
            tagline: true,
            basePrice: true,
            unit: true,
            turnaroundHours: true,
          },
        },
      },
    });
  }

  /**
   * Attach/configure a catalog service for provider.
   */
  async upsertProviderService(
    providerId: string,
    organizationId: string,
    serviceId: string,
    customPrice?: number,
    status: CatalogStatus = CatalogStatus.ACTIVE,
  ): Promise<ProviderService> {
    return this.prisma.providerService.upsert({
      where: {
        providerId_serviceId: {
          providerId,
          serviceId,
        },
      },
      update: {
        ...(customPrice !== undefined ? { customPrice } : {}),
        status,
        updatedAt: new Date(),
      },
      create: {
        providerId,
        organizationId,
        serviceId,
        customPrice,
        status,
      },
    });
  }

  /**
   * Update provider service configuration.
   */
  async updateProviderService(
    providerId: string,
    organizationId: string,
    serviceId: string,
    data: { customPrice?: number; status?: CatalogStatus },
  ): Promise<ProviderService> {
    return this.prisma.providerService.update({
      where: {
        providerId_serviceId: {
          providerId,
          serviceId,
        },
      },
      data: {
        ...(data.customPrice !== undefined ? { customPrice: data.customPrice } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Soft-deactivate a provider service.
   */
  async softDeactivateProviderService(
    providerId: string,
    organizationId: string,
    serviceId: string,
  ): Promise<ProviderService> {
    return this.prisma.providerService.update({
      where: {
        providerId_serviceId: {
          providerId,
          serviceId,
        },
      },
      data: {
        status: CatalogStatus.INACTIVE,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * List provider service areas.
   */
  async findServiceAreas(
    providerId: string,
    organizationId: string,
    skip?: number,
    take?: number,
    search?: string,
  ): Promise<ProviderServiceArea[]> {
    return this.prisma.providerServiceArea.findMany({
      where: {
        providerId,
        organizationId,
        ...(search
          ? {
              OR: [
                { areaName: { contains: search, mode: 'insensitive' } },
                { postalCode: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Count provider service areas.
   */
  async countServiceAreas(
    providerId: string,
    organizationId: string,
    search?: string,
  ): Promise<number> {
    return this.prisma.providerServiceArea.count({
      where: {
        providerId,
        organizationId,
        ...(search
          ? {
              OR: [
                { areaName: { contains: search, mode: 'insensitive' } },
                { postalCode: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    });
  }

  /**
   * Find single service area by ID.
   */
  async findServiceAreaById(
    areaId: string,
    providerId: string,
    organizationId: string,
  ): Promise<ProviderServiceArea | null> {
    return this.prisma.providerServiceArea.findFirst({
      where: {
        id: areaId,
        providerId,
        organizationId,
      },
    });
  }

  /**
   * Find service area by postal code for provider.
   */
  async findServiceAreaByPostalCode(
    providerId: string,
    postalCode: string,
  ): Promise<ProviderServiceArea | null> {
    return this.prisma.providerServiceArea.findUnique({
      where: {
        providerId_postalCode: {
          providerId,
          postalCode,
        },
      },
    });
  }

  /**
   * Create a new service area for provider.
   */
  async createServiceArea(
    providerId: string,
    organizationId: string,
    data: {
      areaName: string;
      postalCode: string;
      city: string;
      isActive?: boolean;
    },
  ): Promise<ProviderServiceArea> {
    return this.prisma.providerServiceArea.create({
      data: {
        providerId,
        organizationId,
        areaName: data.areaName,
        postalCode: data.postalCode,
        city: data.city,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Update service area.
   */
  async updateServiceArea(
    areaId: string,
    providerId: string,
    organizationId: string,
    data: { areaName?: string; city?: string; isActive?: boolean },
  ): Promise<ProviderServiceArea> {
    return this.prisma.providerServiceArea.update({
      where: { id: areaId },
      data: {
        ...(data.areaName !== undefined ? { areaName: data.areaName } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  /**
   * Delete service area.
   */
  async deleteServiceArea(
    areaId: string,
    providerId: string,
    organizationId: string,
  ): Promise<ProviderServiceArea> {
    return this.prisma.providerServiceArea.delete({
      where: { id: areaId },
    });
  }

  /**
   * List provider operating schedule.
   */
  async findAvailabilities(
    providerId: string,
    organizationId: string,
  ): Promise<ProviderAvailability[]> {
    return this.prisma.providerAvailability.findMany({
      where: {
        providerId,
        organizationId,
      },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  /**
   * Find availability by ID.
   */
  async findAvailabilityById(
    availabilityId: string,
    providerId: string,
    organizationId: string,
  ): Promise<ProviderAvailability | null> {
    return this.prisma.providerAvailability.findFirst({
      where: {
        id: availabilityId,
        providerId,
        organizationId,
      },
    });
  }

  /**
   * Find availability by day of week.
   */
  async findAvailabilityByDay(
    providerId: string,
    dayOfWeek: number,
  ): Promise<ProviderAvailability | null> {
    return this.prisma.providerAvailability.findUnique({
      where: {
        providerId_dayOfWeek: {
          providerId,
          dayOfWeek,
        },
      },
    });
  }

  /**
   * Create or update provider availability for a day.
   */
  async upsertAvailability(
    providerId: string,
    organizationId: string,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
      maxDailyOrders?: number;
    },
  ): Promise<ProviderAvailability> {
    return this.prisma.providerAvailability.upsert({
      where: {
        providerId_dayOfWeek: {
          providerId,
          dayOfWeek: data.dayOfWeek,
        },
      },
      update: {
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
        ...(data.maxDailyOrders !== undefined ? { maxDailyOrders: data.maxDailyOrders } : {}),
        updatedAt: new Date(),
      },
      create: {
        providerId,
        organizationId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable ?? true,
        maxDailyOrders: data.maxDailyOrders ?? 30,
      },
    });
  }

  /**
   * Update availability by ID.
   */
  async updateAvailability(
    availabilityId: string,
    providerId: string,
    organizationId: string,
    data: {
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
      maxDailyOrders?: number;
    },
  ): Promise<ProviderAvailability> {
    return this.prisma.providerAvailability.update({
      where: { id: availabilityId },
      data: {
        ...(data.startTime !== undefined ? { startTime: data.startTime } : {}),
        ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
        ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
        ...(data.maxDailyOrders !== undefined ? { maxDailyOrders: data.maxDailyOrders } : {}),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete availability entry.
   */
  async deleteAvailability(
    availabilityId: string,
    providerId: string,
    organizationId: string,
  ): Promise<ProviderAvailability> {
    return this.prisma.providerAvailability.delete({
      where: { id: availabilityId },
    });
  }

  /**
   * List provider documents.
   */
  async findDocuments(
    providerId: string,
    organizationId: string,
    documentType?: string,
    skip?: number,
    take?: number,
  ): Promise<ProviderDocument[]> {
    return this.prisma.providerDocument.findMany({
      where: {
        providerId,
        organizationId,
        ...(documentType ? { documentType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Count provider documents.
   */
  async countDocuments(
    providerId: string,
    organizationId: string,
    documentType?: string,
  ): Promise<number> {
    return this.prisma.providerDocument.count({
      where: {
        providerId,
        organizationId,
        ...(documentType ? { documentType } : {}),
      },
    });
  }

  /**
   * Find document by ID.
   */
  async findDocumentById(
    documentId: string,
    providerId: string,
    organizationId: string,
  ): Promise<ProviderDocument | null> {
    return this.prisma.providerDocument.findFirst({
      where: {
        id: documentId,
        providerId,
        organizationId,
      },
    });
  }

  /**
   * Create document record.
   */
  async createDocument(
    providerId: string,
    organizationId: string,
    data: {
      documentType: string;
      documentNumber?: string;
      documentUrl: string;
    },
  ): Promise<ProviderDocument> {
    return this.prisma.providerDocument.create({
      data: {
        providerId,
        organizationId,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        documentUrl: data.documentUrl,
        verificationStatus: DocumentVerificationStatus.PENDING,
      },
    });
  }

  /**
   * Delete pending document.
   */
  async deleteDocument(
    documentId: string,
    providerId: string,
    organizationId: string,
  ): Promise<ProviderDocument> {
    return this.prisma.providerDocument.delete({
      where: { id: documentId },
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
      // Non-blocking for audit failures
    }
  }
}
