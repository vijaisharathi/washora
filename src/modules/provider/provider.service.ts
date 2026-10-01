import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogStatus, DocumentVerificationStatus, Provider, ProviderStatus } from '@prisma/client';
import {
  ConfigureProviderServiceDto,
  CreateAvailabilityDto,
  CreateServiceAreaDto,
  ProviderAreaQueryDto,
  ProviderAvailabilityResponseDto,
  ProviderDocumentQueryDto,
  ProviderDocumentResponseDto,
  ProviderProfileResponseDto,
  ProviderServiceAreaResponseDto,
  ProviderServiceQueryDto,
  ProviderServiceResponseDto,
  SubmitProviderDocumentDto,
  UpdateAvailabilityDto,
  UpdateProviderProfileDto,
  UpdateProviderServiceDto,
  UpdateServiceAreaDto,
} from './dto';
import { ProviderRepository } from './provider.repository';
import {
  ProviderAuditEventType,
  ProviderErrorCode,
} from './types/provider.types';

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
export class ProviderService {
  constructor(private readonly providerRepository: ProviderRepository) {}

  /**
   * Resolve provider by authenticated user ID and organization context,
   * enforcing account lifecycle status checks.
   */
  async resolveProvider(
    userId: string,
    organizationId: string,
  ): Promise<Provider> {
    const provider = await this.providerRepository.findProviderByUserAndOrg(
      userId,
      organizationId,
    );

    if (!provider) {
      throw new NotFoundException({
        code: ProviderErrorCode.PROVIDER_NOT_FOUND,
        message: 'Provider profile not found for active user in current organization',
      });
    }

    if (provider.status === ProviderStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: ProviderErrorCode.PROVIDER_SUSPENDED,
        message: 'Provider account is suspended. Action is not permitted.',
      });
    }

    if (provider.status === ProviderStatus.INACTIVE) {
      throw new ForbiddenException({
        code: ProviderErrorCode.PROVIDER_INACTIVE,
        message: 'Provider account is inactive. Action is not permitted.',
      });
    }

    return provider;
  }

  // --------------------------------------------------------------------------
  // Profile Methods
  // --------------------------------------------------------------------------

  async getProfile(
    userId: string,
    organizationId: string,
  ): Promise<ProviderProfileResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    return {
      id: provider.publicId,
      fullName: provider.fullName,
      businessName: provider.businessName,
      email: provider.email,
      phone: provider.phone,
      description: provider.description,
      city: provider.city,
      address: provider.address,
      profileImageUrl: provider.profileImageUrl,
      coverImageUrl: provider.coverImageUrl,
      status: provider.status,
      approvalStatus: provider.approvalStatus,
      rating: Number(provider.rating),
      totalReviews: provider.totalReviews,
      joinedAt: provider.joinedAt,
      updatedAt: provider.updatedAt,
    };
  }

  async updateProfile(
    userId: string,
    organizationId: string,
    dto: UpdateProviderProfileDto,
  ): Promise<ProviderProfileResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const updated = await this.providerRepository.updateProviderProfile(
      provider.id,
      organizationId,
      {
        fullName: dto.fullName?.trim(),
        businessName: dto.businessName?.trim(),
        description: dto.description?.trim(),
        phone: dto.phone?.trim(),
        city: dto.city?.trim(),
        address: dto.address?.trim(),
        profileImageUrl: dto.profileImageUrl?.trim(),
        coverImageUrl: dto.coverImageUrl?.trim(),
      },
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'UPDATE_PROVIDER_PROFILE',
      entityType: 'Provider',
      entityId: provider.id,
      metadataJson: {
        updatedFields: Object.keys(dto),
      },
    });

    return {
      id: updated.publicId,
      fullName: updated.fullName,
      businessName: updated.businessName,
      email: updated.email,
      phone: updated.phone,
      description: updated.description,
      city: updated.city,
      address: updated.address,
      profileImageUrl: updated.profileImageUrl,
      coverImageUrl: updated.coverImageUrl,
      status: updated.status,
      approvalStatus: updated.approvalStatus,
      rating: Number(updated.rating),
      totalReviews: updated.totalReviews,
      joinedAt: updated.joinedAt,
      updatedAt: updated.updatedAt,
    };
  }

  // --------------------------------------------------------------------------
  // Service Management Methods
  // --------------------------------------------------------------------------

  async getServices(
    userId: string,
    organizationId: string,
    query: ProviderServiceQueryDto,
  ): Promise<{
    items: ProviderServiceResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const provider = await this.resolveProvider(userId, organizationId);
    const { skip, take, page, limit, status, search } = query;

    const [services, total] = await Promise.all([
      this.providerRepository.findProviderServices(
        provider.id,
        organizationId,
        status,
        skip,
        take,
        search,
      ),
      this.providerRepository.countProviderServices(
        provider.id,
        organizationId,
        status,
        search,
      ),
    ]);

    const items: ProviderServiceResponseDto[] = services.map((ps) => {
      const basePrice = Number(ps.service.basePrice);
      const customPrice = ps.customPrice ? Number(ps.customPrice) : null;
      return {
        id: ps.id,
        providerId: provider.publicId,
        serviceId: ps.service.publicId,
        service: {
          id: ps.service.id,
          publicId: ps.service.publicId,
          name: ps.service.name,
          slug: ps.service.slug,
          tagline: ps.service.tagline,
          basePrice,
          unit: ps.service.unit,
          turnaroundHours: ps.service.turnaroundHours,
        },
        customPrice,
        effectivePrice: customPrice ?? basePrice,
        status: ps.status,
        createdAt: ps.createdAt,
        updatedAt: ps.updatedAt,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getService(
    userId: string,
    organizationId: string,
    serviceIdentifier: string,
  ): Promise<ProviderServiceResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const catalogService =
      await this.providerRepository.findCatalogServiceByIdOrPublicId(
        serviceIdentifier,
        organizationId,
      );

    if (!catalogService) {
      throw new NotFoundException({
        code: ProviderErrorCode.SERVICE_NOT_FOUND,
        message: 'Service not found in organization context',
      });
    }

    const providerService = await this.providerRepository.findProviderService(
      provider.id,
      organizationId,
      catalogService.id,
    );

    if (!providerService) {
      throw new NotFoundException({
        code: ProviderErrorCode.PROVIDER_SERVICE_NOT_FOUND,
        message: 'Provider has not configured this service offering',
      });
    }

    const basePrice = Number(providerService.service.basePrice);
    const customPrice = providerService.customPrice
      ? Number(providerService.customPrice)
      : null;

    return {
      id: providerService.id,
      providerId: provider.publicId,
      serviceId: providerService.service.publicId,
      service: {
        id: providerService.service.id,
        publicId: providerService.service.publicId,
        name: providerService.service.name,
        slug: providerService.service.slug,
        tagline: providerService.service.tagline,
        basePrice,
        unit: providerService.service.unit,
        turnaroundHours: providerService.service.turnaroundHours,
      },
      customPrice,
      effectivePrice: customPrice ?? basePrice,
      status: providerService.status,
      createdAt: providerService.createdAt,
      updatedAt: providerService.updatedAt,
    };
  }

  async addOrConfigureService(
    userId: string,
    organizationId: string,
    serviceIdentifier: string,
    dto: ConfigureProviderServiceDto,
  ): Promise<ProviderServiceResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const catalogService =
      await this.providerRepository.findCatalogServiceByIdOrPublicId(
        serviceIdentifier,
        organizationId,
      );

    if (!catalogService) {
      throw new NotFoundException({
        code: ProviderErrorCode.SERVICE_NOT_FOUND,
        message: 'Catalog service not found in organization context',
      });
    }

    const configured = await this.providerRepository.upsertProviderService(
      provider.id,
      organizationId,
      catalogService.id,
      dto.customPrice,
      dto.status ?? CatalogStatus.ACTIVE,
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'ADD_PROVIDER_SERVICE',
      entityType: 'ProviderService',
      entityId: configured.id,
      metadataJson: {
        serviceId: catalogService.id,
        customPrice: dto.customPrice,
      },
    });

    const basePrice = Number(catalogService.basePrice);
    const customPrice = configured.customPrice
      ? Number(configured.customPrice)
      : null;

    return {
      id: configured.id,
      providerId: provider.publicId,
      serviceId: catalogService.publicId,
      service: {
        id: catalogService.id,
        publicId: catalogService.publicId,
        name: catalogService.name,
        slug: catalogService.slug,
        tagline: catalogService.tagline,
        basePrice,
        unit: catalogService.unit,
        turnaroundHours: catalogService.turnaroundHours,
      },
      customPrice,
      effectivePrice: customPrice ?? basePrice,
      status: configured.status,
      createdAt: configured.createdAt,
      updatedAt: configured.updatedAt,
    };
  }

  async updateService(
    userId: string,
    organizationId: string,
    serviceIdentifier: string,
    dto: UpdateProviderServiceDto,
  ): Promise<ProviderServiceResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const catalogService =
      await this.providerRepository.findCatalogServiceByIdOrPublicId(
        serviceIdentifier,
        organizationId,
      );

    if (!catalogService) {
      throw new NotFoundException({
        code: ProviderErrorCode.SERVICE_NOT_FOUND,
        message: 'Catalog service not found in organization context',
      });
    }

    const existing = await this.providerRepository.findProviderService(
      provider.id,
      organizationId,
      catalogService.id,
    );

    if (!existing) {
      throw new NotFoundException({
        code: ProviderErrorCode.PROVIDER_SERVICE_NOT_FOUND,
        message: 'Provider has not configured this service offering',
      });
    }

    const updated = await this.providerRepository.updateProviderService(
      provider.id,
      organizationId,
      catalogService.id,
      dto,
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'UPDATE_PROVIDER_SERVICE',
      entityType: 'ProviderService',
      entityId: updated.id,
      metadataJson: {
        serviceId: catalogService.id,
        customPrice: dto.customPrice,
        status: dto.status,
      },
    });

    const basePrice = Number(catalogService.basePrice);
    const customPrice = updated.customPrice
      ? Number(updated.customPrice)
      : null;

    return {
      id: updated.id,
      providerId: provider.publicId,
      serviceId: catalogService.publicId,
      service: {
        id: catalogService.id,
        publicId: catalogService.publicId,
        name: catalogService.name,
        slug: catalogService.slug,
        tagline: catalogService.tagline,
        basePrice,
        unit: catalogService.unit,
        turnaroundHours: catalogService.turnaroundHours,
      },
      customPrice,
      effectivePrice: customPrice ?? basePrice,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteService(
    userId: string,
    organizationId: string,
    serviceIdentifier: string,
  ): Promise<{ success: boolean; message: string }> {
    const provider = await this.resolveProvider(userId, organizationId);

    const catalogService =
      await this.providerRepository.findCatalogServiceByIdOrPublicId(
        serviceIdentifier,
        organizationId,
      );

    if (!catalogService) {
      throw new NotFoundException({
        code: ProviderErrorCode.SERVICE_NOT_FOUND,
        message: 'Catalog service not found in organization context',
      });
    }

    const existing = await this.providerRepository.findProviderService(
      provider.id,
      organizationId,
      catalogService.id,
    );

    if (!existing) {
      throw new NotFoundException({
        code: ProviderErrorCode.PROVIDER_SERVICE_NOT_FOUND,
        message: 'Provider has not configured this service offering',
      });
    }

    await this.providerRepository.softDeactivateProviderService(
      provider.id,
      organizationId,
      catalogService.id,
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'DEACTIVATE_PROVIDER_SERVICE',
      entityType: 'ProviderService',
      entityId: existing.id,
      metadataJson: {
        serviceId: catalogService.id,
      },
    });

    return {
      success: true,
      message: 'Provider service offering deactivated',
    };
  }

  // --------------------------------------------------------------------------
  // Service Areas
  // --------------------------------------------------------------------------

  async getServiceAreas(
    userId: string,
    organizationId: string,
    query: ProviderAreaQueryDto,
  ): Promise<{
    items: ProviderServiceAreaResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const provider = await this.resolveProvider(userId, organizationId);
    const { skip, take, page, limit, search } = query;

    const [areas, total] = await Promise.all([
      this.providerRepository.findServiceAreas(
        provider.id,
        organizationId,
        skip,
        take,
        search,
      ),
      this.providerRepository.countServiceAreas(
        provider.id,
        organizationId,
        search,
      ),
    ]);

    const items: ProviderServiceAreaResponseDto[] = areas.map((a) => ({
      id: a.id,
      providerId: provider.publicId,
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
  ): Promise<ProviderServiceAreaResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const area = await this.providerRepository.findServiceAreaById(
      areaId,
      provider.id,
      organizationId,
    );

    if (!area) {
      throw new NotFoundException({
        code: ProviderErrorCode.SERVICE_AREA_NOT_FOUND,
        message: 'Service area not found for provider',
      });
    }

    return {
      id: area.id,
      providerId: provider.publicId,
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
    dto: CreateServiceAreaDto,
  ): Promise<ProviderServiceAreaResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const existing = await this.providerRepository.findServiceAreaByPostalCode(
      provider.id,
      dto.postalCode.trim(),
    );

    if (existing) {
      throw new ConflictException({
        code: ProviderErrorCode.SERVICE_AREA_ALREADY_EXISTS,
        message: `Service area with postal code ${dto.postalCode} already registered for provider`,
      });
    }

    const created = await this.providerRepository.createServiceArea(
      provider.id,
      organizationId,
      {
        areaName: dto.areaName.trim(),
        postalCode: dto.postalCode.trim(),
        city: dto.city.trim(),
        isActive: dto.isActive,
      },
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'CREATE_SERVICE_AREA',
      entityType: 'ProviderServiceArea',
      entityId: created.id,
      metadataJson: {
        postalCode: created.postalCode,
        areaName: created.areaName,
      },
    });

    return {
      id: created.id,
      providerId: provider.publicId,
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
    dto: UpdateServiceAreaDto,
  ): Promise<ProviderServiceAreaResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const existing = await this.providerRepository.findServiceAreaById(
      areaId,
      provider.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundException({
        code: ProviderErrorCode.SERVICE_AREA_NOT_FOUND,
        message: 'Service area not found for provider',
      });
    }

    const updated = await this.providerRepository.updateServiceArea(
      areaId,
      provider.id,
      organizationId,
      {
        areaName: dto.areaName?.trim(),
        city: dto.city?.trim(),
        isActive: dto.isActive,
      },
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'UPDATE_SERVICE_AREA',
      entityType: 'ProviderServiceArea',
      entityId: areaId,
      metadataJson: {
        updatedFields: Object.keys(dto),
      },
    });

    return {
      id: updated.id,
      providerId: provider.publicId,
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
    const provider = await this.resolveProvider(userId, organizationId);

    const existing = await this.providerRepository.findServiceAreaById(
      areaId,
      provider.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundException({
        code: ProviderErrorCode.SERVICE_AREA_NOT_FOUND,
        message: 'Service area not found for provider',
      });
    }

    await this.providerRepository.deleteServiceArea(
      areaId,
      provider.id,
      organizationId,
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'DELETE_SERVICE_AREA',
      entityType: 'ProviderServiceArea',
      entityId: areaId,
    });

    return {
      success: true,
      message: 'Service area removed',
    };
  }

  // --------------------------------------------------------------------------
  // Availability Schedule
  // --------------------------------------------------------------------------

  async getAvailabilities(
    userId: string,
    organizationId: string,
  ): Promise<ProviderAvailabilityResponseDto[]> {
    const provider = await this.resolveProvider(userId, organizationId);

    const schedules = await this.providerRepository.findAvailabilities(
      provider.id,
      organizationId,
    );

    return schedules.map((s) => ({
      id: s.id,
      providerId: provider.publicId,
      dayOfWeek: s.dayOfWeek,
      dayName: DAY_NAMES[s.dayOfWeek] ?? 'Unknown',
      startTime: s.startTime,
      endTime: s.endTime,
      isAvailable: s.isAvailable,
      maxDailyOrders: s.maxDailyOrders,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async upsertAvailability(
    userId: string,
    organizationId: string,
    dto: CreateAvailabilityDto,
  ): Promise<ProviderAvailabilityResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    // Validate start < end
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException({
        code: ProviderErrorCode.AVAILABILITY_CONFLICT,
        message: 'Start time must be strictly before end time',
      });
    }

    const saved = await this.providerRepository.upsertAvailability(
      provider.id,
      organizationId,
      {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime.trim(),
        endTime: dto.endTime.trim(),
        isAvailable: dto.isAvailable,
        maxDailyOrders: dto.maxDailyOrders,
      },
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'UPSERT_AVAILABILITY',
      entityType: 'ProviderAvailability',
      entityId: saved.id,
      metadataJson: {
        dayOfWeek: saved.dayOfWeek,
        startTime: saved.startTime,
        endTime: saved.endTime,
      },
    });

    return {
      id: saved.id,
      providerId: provider.publicId,
      dayOfWeek: saved.dayOfWeek,
      dayName: DAY_NAMES[saved.dayOfWeek] ?? 'Unknown',
      startTime: saved.startTime,
      endTime: saved.endTime,
      isAvailable: saved.isAvailable,
      maxDailyOrders: saved.maxDailyOrders,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async updateAvailability(
    userId: string,
    organizationId: string,
    availabilityId: string,
    dto: UpdateAvailabilityDto,
  ): Promise<ProviderAvailabilityResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const existing = await this.providerRepository.findAvailabilityById(
      availabilityId,
      provider.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundException({
        code: ProviderErrorCode.AVAILABILITY_NOT_FOUND,
        message: 'Availability schedule entry not found for provider',
      });
    }

    const newStart = dto.startTime?.trim() ?? existing.startTime;
    const newEnd = dto.endTime?.trim() ?? existing.endTime;

    if (newStart >= newEnd) {
      throw new BadRequestException({
        code: ProviderErrorCode.AVAILABILITY_CONFLICT,
        message: 'Start time must be strictly before end time',
      });
    }

    const updated = await this.providerRepository.updateAvailability(
      availabilityId,
      provider.id,
      organizationId,
      {
        startTime: dto.startTime?.trim(),
        endTime: dto.endTime?.trim(),
        isAvailable: dto.isAvailable,
        maxDailyOrders: dto.maxDailyOrders,
      },
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'UPDATE_AVAILABILITY',
      entityType: 'ProviderAvailability',
      entityId: availabilityId,
      metadataJson: {
        updatedFields: Object.keys(dto),
      },
    });

    return {
      id: updated.id,
      providerId: provider.publicId,
      dayOfWeek: updated.dayOfWeek,
      dayName: DAY_NAMES[updated.dayOfWeek] ?? 'Unknown',
      startTime: updated.startTime,
      endTime: updated.endTime,
      isAvailable: updated.isAvailable,
      maxDailyOrders: updated.maxDailyOrders,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteAvailability(
    userId: string,
    organizationId: string,
    availabilityId: string,
  ): Promise<{ success: boolean; message: string }> {
    const provider = await this.resolveProvider(userId, organizationId);

    const existing = await this.providerRepository.findAvailabilityById(
      availabilityId,
      provider.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundException({
        code: ProviderErrorCode.AVAILABILITY_NOT_FOUND,
        message: 'Availability schedule entry not found for provider',
      });
    }

    await this.providerRepository.deleteAvailability(
      availabilityId,
      provider.id,
      organizationId,
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'DELETE_AVAILABILITY',
      entityType: 'ProviderAvailability',
      entityId: availabilityId,
    });

    return {
      success: true,
      message: 'Availability schedule removed',
    };
  }

  // --------------------------------------------------------------------------
  // Document Management
  // --------------------------------------------------------------------------

  async getDocuments(
    userId: string,
    organizationId: string,
    query: ProviderDocumentQueryDto,
  ): Promise<{
    items: ProviderDocumentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const provider = await this.resolveProvider(userId, organizationId);
    const { skip, take, page, limit, documentType } = query;

    const [documents, total] = await Promise.all([
      this.providerRepository.findDocuments(
        provider.id,
        organizationId,
        documentType,
        skip,
        take,
      ),
      this.providerRepository.countDocuments(
        provider.id,
        organizationId,
        documentType,
      ),
    ]);

    const items: ProviderDocumentResponseDto[] = documents.map((doc) => ({
      id: doc.id,
      providerId: provider.publicId,
      documentType: doc.documentType,
      documentNumber: doc.documentNumber,
      documentUrl: doc.documentUrl,
      verificationStatus: doc.verificationStatus,
      verifiedAt: doc.verifiedAt,
      rejectionReason: doc.rejectionReason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
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

  async getDocument(
    userId: string,
    organizationId: string,
    documentId: string,
  ): Promise<ProviderDocumentResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const doc = await this.providerRepository.findDocumentById(
      documentId,
      provider.id,
      organizationId,
    );

    if (!doc) {
      throw new NotFoundException({
        code: ProviderErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found for provider',
      });
    }

    return {
      id: doc.id,
      providerId: provider.publicId,
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
    dto: SubmitProviderDocumentDto,
  ): Promise<ProviderDocumentResponseDto> {
    const provider = await this.resolveProvider(userId, organizationId);

    const created = await this.providerRepository.createDocument(
      provider.id,
      organizationId,
      {
        documentType: dto.documentType.trim(),
        documentNumber: dto.documentNumber?.trim(),
        documentUrl: dto.documentUrl.trim(),
      },
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'SUBMIT_PROVIDER_DOCUMENT',
      entityType: 'ProviderDocument',
      entityId: created.id,
      metadataJson: {
        documentType: created.documentType,
      },
    });

    return {
      id: created.id,
      providerId: provider.publicId,
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
    const provider = await this.resolveProvider(userId, organizationId);

    const doc = await this.providerRepository.findDocumentById(
      documentId,
      provider.id,
      organizationId,
    );

    if (!doc) {
      throw new NotFoundException({
        code: ProviderErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found for provider',
      });
    }

    if (doc.verificationStatus === DocumentVerificationStatus.VERIFIED) {
      throw new ForbiddenException({
        code: ProviderErrorCode.DOCUMENT_STATE_INVALID,
        message: 'Verified compliance documents cannot be deleted by provider',
      });
    }

    await this.providerRepository.deleteDocument(
      documentId,
      provider.id,
      organizationId,
    );

    await this.providerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'DELETE_PROVIDER_DOCUMENT',
      entityType: 'ProviderDocument',
      entityId: documentId,
    });

    return {
      success: true,
      message: 'Document removed successfully',
    };
  }
}
