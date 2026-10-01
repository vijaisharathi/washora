import { Injectable } from '@nestjs/common';
import {
  DeliveryAvailability,
  DeliveryDocument,
  DeliveryPartner,
  DeliveryServiceArea,
  Prisma,
  VehicleType,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DeliveryPartnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // Delivery Partner Profile
  // --------------------------------------------------------------------------

  async findPartnerByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<DeliveryPartner | null> {
    return this.prisma.deliveryPartner.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  async findPartnerByPublicId(
    publicId: string,
    organizationId: string,
  ): Promise<DeliveryPartner | null> {
    return this.prisma.deliveryPartner.findUnique({
      where: {
        organizationId_publicId: {
          organizationId,
          publicId,
        },
      },
    });
  }

  async updatePartnerProfile(
    partnerId: string,
    organizationId: string,
    data: {
      fullName?: string;
      phone?: string;
      profileImageUrl?: string | null;
      vehicleType?: VehicleType;
      vehicleNumber?: string | null;
      city?: string;
    },
  ): Promise<DeliveryPartner> {
    return this.prisma.deliveryPartner.update({
      where: {
        id: partnerId,
        organizationId,
      },
      data,
    });
  }

  // --------------------------------------------------------------------------
  // Service Areas
  // --------------------------------------------------------------------------

  async findServiceAreas(
    partnerId: string,
    organizationId: string,
    skip = 0,
    take = 20,
    search?: string,
  ): Promise<DeliveryServiceArea[]> {
    const where: Prisma.DeliveryServiceAreaWhereInput = {
      deliveryPartnerId: partnerId,
      organizationId,
      ...(search
        ? {
            OR: [
              { areaName: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { postalCode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.deliveryServiceArea.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countServiceAreas(
    partnerId: string,
    organizationId: string,
    search?: string,
  ): Promise<number> {
    const where: Prisma.DeliveryServiceAreaWhereInput = {
      deliveryPartnerId: partnerId,
      organizationId,
      ...(search
        ? {
            OR: [
              { areaName: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { postalCode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.deliveryServiceArea.count({ where });
  }

  async findServiceAreaById(
    areaId: string,
    partnerId: string,
    organizationId: string,
  ): Promise<DeliveryServiceArea | null> {
    return this.prisma.deliveryServiceArea.findFirst({
      where: {
        id: areaId,
        deliveryPartnerId: partnerId,
        organizationId,
      },
    });
  }

  async findServiceAreaByPostalCode(
    partnerId: string,
    postalCode: string,
  ): Promise<DeliveryServiceArea | null> {
    return this.prisma.deliveryServiceArea.findUnique({
      where: {
        deliveryPartnerId_postalCode: {
          deliveryPartnerId: partnerId,
          postalCode,
        },
      },
    });
  }

  async createServiceArea(
    partnerId: string,
    organizationId: string,
    data: {
      areaName: string;
      postalCode: string;
      city: string;
      isActive?: boolean;
    },
  ): Promise<DeliveryServiceArea> {
    return this.prisma.deliveryServiceArea.create({
      data: {
        deliveryPartnerId: partnerId,
        organizationId,
        areaName: data.areaName,
        postalCode: data.postalCode,
        city: data.city,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateServiceArea(
    areaId: string,
    partnerId: string,
    organizationId: string,
    data: {
      areaName?: string;
      city?: string;
      isActive?: boolean;
    },
  ): Promise<DeliveryServiceArea> {
    return this.prisma.deliveryServiceArea.update({
      where: {
        id: areaId,
        deliveryPartnerId: partnerId,
        organizationId,
      },
      data,
    });
  }

  async deleteServiceArea(
    areaId: string,
    partnerId: string,
    organizationId: string,
  ): Promise<DeliveryServiceArea> {
    return this.prisma.deliveryServiceArea.delete({
      where: {
        id: areaId,
        deliveryPartnerId: partnerId,
        organizationId,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Availability Schedule
  // --------------------------------------------------------------------------

  async findAvailabilities(
    partnerId: string,
    organizationId: string,
  ): Promise<DeliveryAvailability[]> {
    return this.prisma.deliveryAvailability.findMany({
      where: {
        deliveryPartnerId: partnerId,
        organizationId,
      },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async findAvailabilityById(
    availabilityId: string,
    partnerId: string,
    organizationId: string,
  ): Promise<DeliveryAvailability | null> {
    return this.prisma.deliveryAvailability.findFirst({
      where: {
        id: availabilityId,
        deliveryPartnerId: partnerId,
        organizationId,
      },
    });
  }

  async findAvailabilityByDay(
    partnerId: string,
    dayOfWeek: number,
  ): Promise<DeliveryAvailability | null> {
    return this.prisma.deliveryAvailability.findUnique({
      where: {
        deliveryPartnerId_dayOfWeek: {
          deliveryPartnerId: partnerId,
          dayOfWeek,
        },
      },
    });
  }

  async createAvailability(
    partnerId: string,
    organizationId: string,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    },
  ): Promise<DeliveryAvailability> {
    return this.prisma.deliveryAvailability.create({
      data: {
        deliveryPartnerId: partnerId,
        organizationId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable ?? true,
      },
    });
  }

  async updateAvailability(
    availabilityId: string,
    partnerId: string,
    organizationId: string,
    data: {
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
    },
  ): Promise<DeliveryAvailability> {
    return this.prisma.deliveryAvailability.update({
      where: {
        id: availabilityId,
        deliveryPartnerId: partnerId,
        organizationId,
      },
      data,
    });
  }

  async deleteAvailability(
    availabilityId: string,
    partnerId: string,
    organizationId: string,
  ): Promise<DeliveryAvailability> {
    return this.prisma.deliveryAvailability.delete({
      where: {
        id: availabilityId,
        deliveryPartnerId: partnerId,
        organizationId,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Delivery Documents (KYC & Compliance)
  // --------------------------------------------------------------------------

  async findDocuments(
    partnerId: string,
    organizationId: string,
    documentType?: string,
    skip = 0,
    take = 20,
  ): Promise<DeliveryDocument[]> {
    const where: Prisma.DeliveryDocumentWhereInput = {
      deliveryPartnerId: partnerId,
      organizationId,
      ...(documentType ? { documentType } : {}),
    };

    return this.prisma.deliveryDocument.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countDocuments(
    partnerId: string,
    organizationId: string,
    documentType?: string,
  ): Promise<number> {
    const where: Prisma.DeliveryDocumentWhereInput = {
      deliveryPartnerId: partnerId,
      organizationId,
      ...(documentType ? { documentType } : {}),
    };

    return this.prisma.deliveryDocument.count({ where });
  }

  async findDocumentById(
    documentId: string,
    partnerId: string,
    organizationId: string,
  ): Promise<DeliveryDocument | null> {
    return this.prisma.deliveryDocument.findFirst({
      where: {
        id: documentId,
        deliveryPartnerId: partnerId,
        organizationId,
      },
    });
  }

  async createDocument(
    partnerId: string,
    organizationId: string,
    data: {
      documentType: string;
      documentNumber?: string | null;
      documentUrl: string;
    },
  ): Promise<DeliveryDocument> {
    return this.prisma.deliveryDocument.create({
      data: {
        deliveryPartnerId: partnerId,
        organizationId,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        documentUrl: data.documentUrl,
      },
    });
  }

  async deleteDocument(
    documentId: string,
    partnerId: string,
    organizationId: string,
  ): Promise<DeliveryDocument> {
    return this.prisma.deliveryDocument.delete({
      where: {
        id: documentId,
        deliveryPartnerId: partnerId,
        organizationId,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Audit Trail Events
  // --------------------------------------------------------------------------

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
