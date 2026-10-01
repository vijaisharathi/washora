import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryPartner,
  DeliveryPartnerStatus,
  DocumentVerificationStatus,
} from '@prisma/client';
import {
  CreateDeliveryAvailabilityDto,
  CreateDeliveryServiceAreaDto,
  DeliveryPartnerAreaQueryDto,
  DeliveryPartnerAvailabilityResponseDto,
  DeliveryPartnerDocumentQueryDto,
  DeliveryPartnerDocumentResponseDto,
  DeliveryPartnerProfileResponseDto,
  DeliveryPartnerServiceAreaResponseDto,
  SubmitDeliveryDocumentDto,
  UpdateDeliveryAvailabilityDto,
  UpdateDeliveryPartnerProfileDto,
  UpdateDeliveryServiceAreaDto,
} from './dto';
import { DeliveryPartnerRepository } from './delivery-partner.repository';
import {
  DeliveryPartnerAuditEventType,
  DeliveryPartnerErrorCode,
} from './types/delivery-partner.types';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

@Injectable()
export class DeliveryPartnerService {
  constructor(
    private readonly deliveryPartnerRepository: DeliveryPartnerRepository,
  ) {}

  /**
   * Resolve delivery partner identity by authenticated user ID and organization context,
   * enforcing account lifecycle status checks.
   */
  async resolveDeliveryPartner(
    userId: string,
    organizationId: string,
  ): Promise<DeliveryPartner> {
    const partner =
      await this.deliveryPartnerRepository.findPartnerByUserAndOrg(
        userId,
        organizationId,
      );

    if (!partner) {
      throw new NotFoundException({
        code: DeliveryPartnerErrorCode.DELIVERY_PARTNER_NOT_FOUND,
        message:
          'Delivery partner profile not found for active user in current organization',
      });
    }

    if (partner.status === DeliveryPartnerStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: DeliveryPartnerErrorCode.DELIVERY_PARTNER_SUSPENDED,
        message: 'Delivery partner account is suspended. Action is not permitted.',
      });
    }

    if (partner.status === DeliveryPartnerStatus.INACTIVE) {
      throw new ForbiddenException({
        code: DeliveryPartnerErrorCode.DELIVERY_PARTNER_INACTIVE,
        message: 'Delivery partner account is inactive. Action is not permitted.',
      });
    }

    return partner;
  }

  // --------------------------------------------------------------------------
  // Profile Methods
  // --------------------------------------------------------------------------

  async getProfile(
    userId: string,
    organizationId: string,
  ): Promise<DeliveryPartnerProfileResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    return {
      id: partner.publicId,
      fullName: partner.fullName,
      email: partner.email,
      phone: partner.phone,
      profileImageUrl: partner.profileImageUrl,
      vehicleType: partner.vehicleType,
      vehicleNumber: partner.vehicleNumber,
      city: partner.city,
      status: partner.status,
      approvalStatus: partner.approvalStatus,
      rating: Number(partner.rating),
      totalDeliveries: partner.totalDeliveries,
      completedDeliveries: partner.completedDeliveries,
      totalEarnings: Number(partner.totalEarnings),
      lastActiveAt: partner.lastActiveAt,
      joinedAt: partner.joinedAt,
      updatedAt: partner.updatedAt,
    };
  }

  async updateProfile(
    userId: string,
    organizationId: string,
    dto: UpdateDeliveryPartnerProfileDto,
  ): Promise<DeliveryPartnerProfileResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const updated = await this.deliveryPartnerRepository.updatePartnerProfile(
      partner.id,
      organizationId,
      {
        fullName: dto.fullName?.trim(),
        phone: dto.phone?.trim(),
        profileImageUrl: dto.profileImageUrl?.trim(),
        vehicleType: dto.vehicleType,
        vehicleNumber: dto.vehicleNumber?.trim().toUpperCase(),
        city: dto.city?.trim(),
      },
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action:
        DeliveryPartnerAuditEventType.DELIVERY_PARTNER_PROFILE_UPDATED,
      entityType: 'DeliveryPartner',
      entityId: partner.id,
      metadataJson: {
        updatedFields: Object.keys(dto),
      },
    });

    return {
      id: updated.publicId,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      profileImageUrl: updated.profileImageUrl,
      vehicleType: updated.vehicleType,
      vehicleNumber: updated.vehicleNumber,
      city: updated.city,
      status: updated.status,
      approvalStatus: updated.approvalStatus,
      rating: Number(updated.rating),
      totalDeliveries: updated.totalDeliveries,
      completedDeliveries: updated.completedDeliveries,
      totalEarnings: Number(updated.totalEarnings),
      lastActiveAt: updated.lastActiveAt,
      joinedAt: updated.joinedAt,
      updatedAt: updated.updatedAt,
    };
  }

  // --------------------------------------------------------------------------
  // Service Area Methods
  // --------------------------------------------------------------------------

  async getServiceAreas(
    userId: string,
    organizationId: string,
    query: DeliveryPartnerAreaQueryDto,
  ): Promise<{
    items: DeliveryPartnerServiceAreaResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);
    const { skip, take, page, limit, search } = query;

    const [areas, total] = await Promise.all([
      this.deliveryPartnerRepository.findServiceAreas(
        partner.id,
        organizationId,
        skip,
        take,
        search,
      ),
      this.deliveryPartnerRepository.countServiceAreas(
        partner.id,
        organizationId,
        search,
      ),
    ]);

    const items: DeliveryPartnerServiceAreaResponseDto[] = areas.map((a) => ({
      id: a.id,
      deliveryPartnerId: partner.publicId,
      areaName: a.areaName,
      postalCode: a.postalCode,
      city: a.city,
      isActive: a.isActive,
      createdAt: a.createdAt,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getServiceArea(
    userId: string,
    organizationId: string,
    areaId: string,
  ): Promise<DeliveryPartnerServiceAreaResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const area = await this.deliveryPartnerRepository.findServiceAreaById(
      areaId,
      partner.id,
      organizationId,
    );

    if (!area) {
      throw new NotFoundException({
        code: DeliveryPartnerErrorCode.SERVICE_AREA_NOT_FOUND,
        message: 'Service area not found for delivery partner',
      });
    }

    return {
      id: area.id,
      deliveryPartnerId: partner.publicId,
      areaName: area.areaName,
      postalCode: area.postalCode,
      city: area.city,
      isActive: area.isActive,
      createdAt: area.createdAt,
    };
  }

  async createServiceArea(
    userId: string,
    organizationId: string,
    dto: CreateDeliveryServiceAreaDto,
  ): Promise<DeliveryPartnerServiceAreaResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const existing =
      await this.deliveryPartnerRepository.findServiceAreaByPostalCode(
        partner.id,
        dto.postalCode.trim(),
      );

    if (existing) {
      throw new ConflictException({
        code: DeliveryPartnerErrorCode.SERVICE_AREA_ALREADY_EXISTS,
        message: `Service area with postal code ${dto.postalCode} already registered for delivery partner`,
      });
    }

    const created = await this.deliveryPartnerRepository.createServiceArea(
      partner.id,
      organizationId,
      {
        areaName: dto.areaName.trim(),
        postalCode: dto.postalCode.trim(),
        city: dto.city.trim(),
        isActive: dto.isActive,
      },
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action: DeliveryPartnerAuditEventType.DELIVERY_SERVICE_AREA_CREATED,
      entityType: 'DeliveryServiceArea',
      entityId: created.id,
      metadataJson: {
        postalCode: created.postalCode,
        areaName: created.areaName,
      },
    });

    return {
      id: created.id,
      deliveryPartnerId: partner.publicId,
      areaName: created.areaName,
      postalCode: created.postalCode,
      city: created.city,
      isActive: created.isActive,
      createdAt: created.createdAt,
    };
  }

  async updateServiceArea(
    userId: string,
    organizationId: string,
    areaId: string,
    dto: UpdateDeliveryServiceAreaDto,
  ): Promise<DeliveryPartnerServiceAreaResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const existing = await this.deliveryPartnerRepository.findServiceAreaById(
      areaId,
      partner.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundException({
        code: DeliveryPartnerErrorCode.SERVICE_AREA_NOT_FOUND,
        message: 'Service area not found for delivery partner',
      });
    }

    const updated = await this.deliveryPartnerRepository.updateServiceArea(
      areaId,
      partner.id,
      organizationId,
      {
        areaName: dto.areaName?.trim(),
        city: dto.city?.trim(),
        isActive: dto.isActive,
      },
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action: DeliveryPartnerAuditEventType.DELIVERY_SERVICE_AREA_UPDATED,
      entityType: 'DeliveryServiceArea',
      entityId: areaId,
      metadataJson: {
        updatedFields: Object.keys(dto),
      },
    });

    return {
      id: updated.id,
      deliveryPartnerId: partner.publicId,
      areaName: updated.areaName,
      postalCode: updated.postalCode,
      city: updated.city,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    };
  }

  async deleteServiceArea(
    userId: string,
    organizationId: string,
    areaId: string,
  ): Promise<{ success: boolean; message: string }> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const existing = await this.deliveryPartnerRepository.findServiceAreaById(
      areaId,
      partner.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundException({
        code: DeliveryPartnerErrorCode.SERVICE_AREA_NOT_FOUND,
        message: 'Service area not found for delivery partner',
      });
    }

    await this.deliveryPartnerRepository.deleteServiceArea(
      areaId,
      partner.id,
      organizationId,
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action: DeliveryPartnerAuditEventType.DELIVERY_SERVICE_AREA_REMOVED,
      entityType: 'DeliveryServiceArea',
      entityId: areaId,
    });

    return {
      success: true,
      message: 'Service area removed',
    };
  }

  // --------------------------------------------------------------------------
  // Availability Schedule Methods
  // --------------------------------------------------------------------------

  async getAvailabilities(
    userId: string,
    organizationId: string,
  ): Promise<DeliveryPartnerAvailabilityResponseDto[]> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const schedules =
      await this.deliveryPartnerRepository.findAvailabilities(
        partner.id,
        organizationId,
      );

    return schedules.map((s) => ({
      id: s.id,
      deliveryPartnerId: partner.publicId,
      dayOfWeek: s.dayOfWeek,
      dayName: DAY_NAMES[s.dayOfWeek] ?? 'Unknown',
      startTime: s.startTime,
      endTime: s.endTime,
      isAvailable: s.isAvailable,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async createAvailability(
    userId: string,
    organizationId: string,
    dto: CreateDeliveryAvailabilityDto,
  ): Promise<DeliveryPartnerAvailabilityResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    // Validate start < end
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException({
        code: DeliveryPartnerErrorCode.AVAILABILITY_CONFLICT,
        message: 'Start time must be strictly before end time',
      });
    }

    const existing =
      await this.deliveryPartnerRepository.findAvailabilityByDay(
        partner.id,
        dto.dayOfWeek,
      );

    if (existing) {
      throw new ConflictException({
        code: DeliveryPartnerErrorCode.AVAILABILITY_CONFLICT,
        message: `Availability schedule already exists for day ${dto.dayOfWeek}`,
      });
    }

    const created = await this.deliveryPartnerRepository.createAvailability(
      partner.id,
      organizationId,
      {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime.trim(),
        endTime: dto.endTime.trim(),
        isAvailable: dto.isAvailable,
      },
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action: DeliveryPartnerAuditEventType.DELIVERY_AVAILABILITY_CREATED,
      entityType: 'DeliveryAvailability',
      entityId: created.id,
      metadataJson: {
        dayOfWeek: created.dayOfWeek,
        startTime: created.startTime,
        endTime: created.endTime,
      },
    });

    return {
      id: created.id,
      deliveryPartnerId: partner.publicId,
      dayOfWeek: created.dayOfWeek,
      dayName: DAY_NAMES[created.dayOfWeek] ?? 'Unknown',
      startTime: created.startTime,
      endTime: created.endTime,
      isAvailable: created.isAvailable,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateAvailability(
    userId: string,
    organizationId: string,
    availabilityId: string,
    dto: UpdateDeliveryAvailabilityDto,
  ): Promise<DeliveryPartnerAvailabilityResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const existing =
      await this.deliveryPartnerRepository.findAvailabilityById(
        availabilityId,
        partner.id,
        organizationId,
      );

    if (!existing) {
      throw new NotFoundException({
        code: DeliveryPartnerErrorCode.AVAILABILITY_NOT_FOUND,
        message: 'Availability schedule entry not found for delivery partner',
      });
    }

    const newStart = dto.startTime?.trim() ?? existing.startTime;
    const newEnd = dto.endTime?.trim() ?? existing.endTime;

    if (newStart >= newEnd) {
      throw new BadRequestException({
        code: DeliveryPartnerErrorCode.AVAILABILITY_CONFLICT,
        message: 'Start time must be strictly before end time',
      });
    }

    const updated = await this.deliveryPartnerRepository.updateAvailability(
      availabilityId,
      partner.id,
      organizationId,
      {
        startTime: dto.startTime?.trim(),
        endTime: dto.endTime?.trim(),
        isAvailable: dto.isAvailable,
      },
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action: DeliveryPartnerAuditEventType.DELIVERY_AVAILABILITY_UPDATED,
      entityType: 'DeliveryAvailability',
      entityId: availabilityId,
      metadataJson: {
        updatedFields: Object.keys(dto),
      },
    });

    return {
      id: updated.id,
      deliveryPartnerId: partner.publicId,
      dayOfWeek: updated.dayOfWeek,
      dayName: DAY_NAMES[updated.dayOfWeek] ?? 'Unknown',
      startTime: updated.startTime,
      endTime: updated.endTime,
      isAvailable: updated.isAvailable,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteAvailability(
    userId: string,
    organizationId: string,
    availabilityId: string,
  ): Promise<{ success: boolean; message: string }> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const existing =
      await this.deliveryPartnerRepository.findAvailabilityById(
        availabilityId,
        partner.id,
        organizationId,
      );

    if (!existing) {
      throw new NotFoundException({
        code: DeliveryPartnerErrorCode.AVAILABILITY_NOT_FOUND,
        message: 'Availability schedule entry not found for delivery partner',
      });
    }

    await this.deliveryPartnerRepository.deleteAvailability(
      availabilityId,
      partner.id,
      organizationId,
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action: DeliveryPartnerAuditEventType.DELIVERY_AVAILABILITY_REMOVED,
      entityType: 'DeliveryAvailability',
      entityId: availabilityId,
    });

    return {
      success: true,
      message: 'Availability schedule removed',
    };
  }

  // --------------------------------------------------------------------------
  // Document Management Methods
  // --------------------------------------------------------------------------

  async getDocuments(
    userId: string,
    organizationId: string,
    query: DeliveryPartnerDocumentQueryDto,
  ): Promise<{
    items: DeliveryPartnerDocumentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);
    const { skip, take, page, limit, documentType } = query;

    const [documents, total] = await Promise.all([
      this.deliveryPartnerRepository.findDocuments(
        partner.id,
        organizationId,
        documentType,
        skip,
        take,
      ),
      this.deliveryPartnerRepository.countDocuments(
        partner.id,
        organizationId,
        documentType,
      ),
    ]);

    const items: DeliveryPartnerDocumentResponseDto[] = documents.map(
      (doc) => ({
        id: doc.id,
        deliveryPartnerId: partner.publicId,
        documentType: doc.documentType,
        documentNumber: doc.documentNumber,
        documentUrl: doc.documentUrl,
        verificationStatus: doc.verificationStatus,
        verifiedAt: doc.verifiedAt,
        rejectionReason: doc.rejectionReason,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }),
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getDocument(
    userId: string,
    organizationId: string,
    documentId: string,
  ): Promise<DeliveryPartnerDocumentResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const doc = await this.deliveryPartnerRepository.findDocumentById(
      documentId,
      partner.id,
      organizationId,
    );

    if (!doc) {
      throw new NotFoundException({
        code: DeliveryPartnerErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found for delivery partner',
      });
    }

    return {
      id: doc.id,
      deliveryPartnerId: partner.publicId,
      documentType: doc.documentType,
      documentNumber: doc.documentNumber,
      documentUrl: doc.documentUrl,
      verificationStatus: doc.verificationStatus,
      verifiedAt: doc.verifiedAt,
      rejectionReason: doc.rejectionReason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async submitDocument(
    userId: string,
    organizationId: string,
    dto: SubmitDeliveryDocumentDto,
  ): Promise<DeliveryPartnerDocumentResponseDto> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const created = await this.deliveryPartnerRepository.createDocument(
      partner.id,
      organizationId,
      {
        documentType: dto.documentType.trim(),
        documentNumber: dto.documentNumber?.trim(),
        documentUrl: dto.documentUrl.trim(),
      },
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action: DeliveryPartnerAuditEventType.DELIVERY_DOCUMENT_SUBMITTED,
      entityType: 'DeliveryDocument',
      entityId: created.id,
      metadataJson: {
        documentType: created.documentType,
      },
    });

    return {
      id: created.id,
      deliveryPartnerId: partner.publicId,
      documentType: created.documentType,
      documentNumber: created.documentNumber,
      documentUrl: created.documentUrl,
      verificationStatus: created.verificationStatus,
      verifiedAt: created.verifiedAt,
      rejectionReason: created.rejectionReason,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async deleteDocument(
    userId: string,
    organizationId: string,
    documentId: string,
  ): Promise<{ success: boolean; message: string }> {
    const partner = await this.resolveDeliveryPartner(userId, organizationId);

    const doc = await this.deliveryPartnerRepository.findDocumentById(
      documentId,
      partner.id,
      organizationId,
    );

    if (!doc) {
      throw new NotFoundException({
        code: DeliveryPartnerErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found for delivery partner',
      });
    }

    if (doc.verificationStatus === DocumentVerificationStatus.VERIFIED) {
      throw new ForbiddenException({
        code: DeliveryPartnerErrorCode.DOCUMENT_STATE_INVALID,
        message:
          'Verified compliance documents cannot be deleted by delivery partner',
      });
    }

    await this.deliveryPartnerRepository.deleteDocument(
      documentId,
      partner.id,
      organizationId,
    );

    await this.deliveryPartnerRepository.createAuditEvent({
      organizationId,
      userId,
      action: DeliveryPartnerAuditEventType.DELIVERY_DOCUMENT_REMOVED,
      entityType: 'DeliveryDocument',
      entityId: documentId,
    });

    return {
      success: true,
      message: 'Document removed successfully',
    };
  }
}
