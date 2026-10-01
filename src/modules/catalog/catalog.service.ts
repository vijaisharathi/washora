import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogStatus, Service, ServiceCategory, ServiceImage, ServiceVariant } from '@prisma/client';
import { CatalogRepository } from './catalog.repository';
import {
  CatalogCategoryQueryDto,
  CatalogServiceQueryDto,
  CategoryResponseDto,
  CreateCategoryDto,
  CreateServiceDto,
  CreateServiceImageDto,
  CreateServiceVariantDto,
  ServiceDetailResponseDto,
  ServiceImageResponseDto,
  ServiceResponseDto,
  ServiceSummaryDto,
  ServiceVariantResponseDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
  UpdateServiceDto,
  UpdateServiceImageDto,
  UpdateServiceStatusDto,
  UpdateServiceVariantDto,
} from './dto';
import { CatalogAuditEventType, CatalogErrorCode } from './types/catalog.types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  // ==========================================================================
  // HELPERS: PUBLIC ID & SLUG
  // ==========================================================================

  private async generateCategoryPublicId(organizationId: string): Promise<string> {
    const count = await this.catalogRepository.getCategoryCount(organizationId);
    return `CAT-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateServicePublicId(organizationId: string): Promise<string> {
    const count = await this.catalogRepository.getServiceCount(organizationId);
    return `SVC-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateVariantPublicId(organizationId: string): Promise<string> {
    const count = await this.catalogRepository.getVariantCount(organizationId);
    return `VAR-${String(count + 1).padStart(4, '0')}`;
  }

  // ==========================================================================
  // CATEGORIES
  // ==========================================================================

  async createCategory(
    dto: CreateCategoryDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<CategoryResponseDto> {
    const slug = slugify(dto.slug || dto.name);

    // Verify slug uniqueness in organization
    const existingSlug = await this.catalogRepository.findCategoryBySlug(slug, organizationId);
    if (existingSlug) {
      throw new ConflictException({
        code: CatalogErrorCode.DUPLICATE_CATEGORY_SLUG,
        message: `A category with slug '${slug}' already exists in this organization.`,
      });
    }

    let publicId = await this.generateCategoryPublicId(organizationId);
    const existingPublic = await this.catalogRepository.findCategoryByIdOrPublicId(publicId, organizationId);
    if (existingPublic) {
      publicId = `CAT-${Date.now().toString(36).toUpperCase()}`;
    }

    const category = await this.catalogRepository.createCategory({
      publicId,
      organizationId,
      name: dto.name,
      slug,
      description: dto.description,
      iconUrl: dto.iconUrl,
      bannerUrl: dto.bannerUrl,
      displayOrder: dto.displayOrder ?? 0,
      status: dto.status ?? CatalogStatus.ACTIVE,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.CATEGORY_CREATED,
      entityType: 'ServiceCategory',
      entityId: category.id,
      metadataJson: { name: category.name, slug: category.slug, publicId: category.publicId },
    });

    return this.mapCategoryToResponse(category, 0);
  }

  async getCategories(
    query: CatalogCategoryQueryDto,
    organizationId: string,
    isAdminOrOps = false,
  ): Promise<{
    items: CategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Non-admin callers only see ACTIVE categories
    const effectiveStatus = isAdminOrOps ? query.status : CatalogStatus.ACTIVE;

    const { items, total } = await this.catalogRepository.findCategories(organizationId, {
      status: effectiveStatus,
      search: query.search,
      skip,
      take: limit,
    });

    // Attach active services count for each category
    const itemsWithCounts = await Promise.all(
      items.map(async (cat) => {
        const servicesCount = await this.catalogRepository.countServicesInCategory(
          cat.id,
          organizationId,
          CatalogStatus.ACTIVE,
        );
        return this.mapCategoryToResponse(cat, servicesCount);
      }),
    );

    return {
      items: itemsWithCounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getCategoryById(
    identifier: string,
    organizationId: string,
    isAdminOrOps = false,
  ): Promise<CategoryResponseDto> {
    const category = await this.catalogRepository.findCategoryByIdOrPublicId(identifier, organizationId);
    if (!category) {
      throw new NotFoundException({
        code: CatalogErrorCode.CATEGORY_NOT_FOUND,
        message: `Category '${identifier}' not found in current organization.`,
      });
    }

    if (!isAdminOrOps && category.status !== CatalogStatus.ACTIVE) {
      throw new NotFoundException({
        code: CatalogErrorCode.CATEGORY_NOT_FOUND,
        message: `Category '${identifier}' is not currently available.`,
      });
    }

    const servicesCount = await this.catalogRepository.countServicesInCategory(
      category.id,
      organizationId,
      CatalogStatus.ACTIVE,
    );

    return this.mapCategoryToResponse(category, servicesCount);
  }

  async getCategoryBySlug(
    slug: string,
    organizationId: string,
    isAdminOrOps = false,
  ): Promise<CategoryResponseDto> {
    const category = await this.catalogRepository.findCategoryBySlug(slug, organizationId);
    if (!category) {
      throw new NotFoundException({
        code: CatalogErrorCode.CATEGORY_NOT_FOUND,
        message: `Category with slug '${slug}' not found in current organization.`,
      });
    }

    if (!isAdminOrOps && category.status !== CatalogStatus.ACTIVE) {
      throw new NotFoundException({
        code: CatalogErrorCode.CATEGORY_NOT_FOUND,
        message: `Category with slug '${slug}' is not currently available.`,
      });
    }

    const servicesCount = await this.catalogRepository.countServicesInCategory(
      category.id,
      organizationId,
      CatalogStatus.ACTIVE,
    );

    return this.mapCategoryToResponse(category, servicesCount);
  }

  async updateCategory(
    identifier: string,
    dto: UpdateCategoryDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.catalogRepository.findCategoryByIdOrPublicId(identifier, organizationId);
    if (!category) {
      throw new NotFoundException({
        code: CatalogErrorCode.CATEGORY_NOT_FOUND,
        message: `Category '${identifier}' not found in current organization.`,
      });
    }

    let slug: string | undefined = undefined;
    if (dto.slug || dto.name) {
      slug = slugify(dto.slug || dto.name || category.name);
      if (slug !== category.slug) {
        const duplicate = await this.catalogRepository.findCategoryBySlug(slug, organizationId);
        if (duplicate && duplicate.id !== category.id) {
          throw new ConflictException({
            code: CatalogErrorCode.DUPLICATE_CATEGORY_SLUG,
            message: `A category with slug '${slug}' already exists in this organization.`,
          });
        }
      }
    }

    const updated = await this.catalogRepository.updateCategory(category.id, {
      name: dto.name,
      slug,
      description: dto.description,
      iconUrl: dto.iconUrl,
      bannerUrl: dto.bannerUrl,
      displayOrder: dto.displayOrder,
      status: dto.status,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.CATEGORY_UPDATED,
      entityType: 'ServiceCategory',
      entityId: updated.id,
      metadataJson: { changes: dto },
    });

    const servicesCount = await this.catalogRepository.countServicesInCategory(
      updated.id,
      organizationId,
      CatalogStatus.ACTIVE,
    );

    return this.mapCategoryToResponse(updated, servicesCount);
  }

  async updateCategoryStatus(
    identifier: string,
    dto: UpdateCategoryStatusDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.catalogRepository.findCategoryByIdOrPublicId(identifier, organizationId);
    if (!category) {
      throw new NotFoundException({
        code: CatalogErrorCode.CATEGORY_NOT_FOUND,
        message: `Category '${identifier}' not found in current organization.`,
      });
    }

    const updated = await this.catalogRepository.updateCategory(category.id, {
      status: dto.status,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.CATEGORY_STATUS_CHANGED,
      entityType: 'ServiceCategory',
      entityId: updated.id,
      metadataJson: { previousStatus: category.status, newStatus: dto.status },
    });

    const servicesCount = await this.catalogRepository.countServicesInCategory(
      updated.id,
      organizationId,
      CatalogStatus.ACTIVE,
    );

    return this.mapCategoryToResponse(updated, servicesCount);
  }

  async deleteCategory(
    identifier: string,
    organizationId: string,
    actorUserId?: string,
  ): Promise<{ message: string; deletedId: string }> {
    const category = await this.catalogRepository.findCategoryByIdOrPublicId(identifier, organizationId);
    if (!category) {
      throw new NotFoundException({
        code: CatalogErrorCode.CATEGORY_NOT_FOUND,
        message: `Category '${identifier}' not found in current organization.`,
      });
    }

    // Check safeguard: active services in category
    const activeServicesCount = await this.catalogRepository.countServicesInCategory(
      category.id,
      organizationId,
      CatalogStatus.ACTIVE,
    );

    if (activeServicesCount > 0) {
      throw new BadRequestException({
        code: CatalogErrorCode.CATEGORY_HAS_ACTIVE_SERVICES,
        message: `Cannot delete category with ${activeServicesCount} active service(s). Deactivate or reassign them first.`,
      });
    }

    await this.catalogRepository.deleteCategory(category.id);

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.CATEGORY_DELETED,
      entityType: 'ServiceCategory',
      entityId: category.id,
      metadataJson: { name: category.name, publicId: category.publicId },
    });

    return {
      message: `Category '${category.name}' (${category.publicId}) successfully deleted.`,
      deletedId: category.id,
    };
  }

  // ==========================================================================
  // SERVICES
  // ==========================================================================

  async createService(
    dto: CreateServiceDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<ServiceResponseDto> {
    // Validate category exists in same organization
    const category = await this.catalogRepository.findCategoryByIdOrPublicId(dto.categoryId, organizationId);
    if (!category) {
      throw new NotFoundException({
        code: CatalogErrorCode.CATEGORY_NOT_FOUND,
        message: `Category '${dto.categoryId}' not found in current organization.`,
      });
    }

    const slug = slugify(dto.slug || dto.name);
    const existingSlug = await this.catalogRepository.findServiceBySlug(slug, organizationId);
    if (existingSlug) {
      throw new ConflictException({
        code: CatalogErrorCode.DUPLICATE_SERVICE_SLUG,
        message: `A service with slug '${slug}' already exists in this organization.`,
      });
    }

    let publicId = await this.generateServicePublicId(organizationId);
    const existingPublic = await this.catalogRepository.findServiceByIdOrPublicId(publicId, organizationId);
    if (existingPublic) {
      publicId = `SVC-${Date.now().toString(36).toUpperCase()}`;
    }

    const service = await this.catalogRepository.createService({
      publicId,
      organizationId,
      categoryId: category.id,
      name: dto.name,
      slug,
      tagline: dto.tagline,
      description: dto.description,
      basePrice: dto.basePrice,
      unit: dto.unit ?? 'kg',
      turnaroundHours: dto.turnaroundHours ?? 24,
      isFeatured: dto.isFeatured ?? false,
      status: dto.status ?? CatalogStatus.ACTIVE,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.SERVICE_CREATED,
      entityType: 'Service',
      entityId: service.id,
      metadataJson: { name: service.name, publicId: service.publicId, basePrice: dto.basePrice },
    });

    return this.mapServiceToDetailResponse(service, category, [], []);
  }

  async getServices(
    query: CatalogServiceQueryDto,
    organizationId: string,
    isAdminOrOps = false,
  ): Promise<{
    items: ServiceSummaryDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Resolve categoryId if passed as publicId
    let categoryDbId: string | undefined = undefined;
    if (query.categoryId) {
      const cat = await this.catalogRepository.findCategoryByIdOrPublicId(query.categoryId, organizationId);
      if (cat) {
        categoryDbId = cat.id;
      } else {
        return { items: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // Non-admins can only see ACTIVE services
    const effectiveStatus = isAdminOrOps ? query.status : CatalogStatus.ACTIVE;

    const { items, total } = await this.catalogRepository.findServices(organizationId, {
      categoryId: categoryDbId,
      status: effectiveStatus,
      isFeatured: query.isFeatured,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      skip,
      take: limit,
    });

    const mappedItems = items.map((svc) =>
      this.mapServiceToSummaryResponse(svc, svc.category, svc.images),
    );

    return {
      items: mappedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getServiceById(
    identifier: string,
    organizationId: string,
    isAdminOrOps = false,
  ): Promise<ServiceResponseDto> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(identifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Service '${identifier}' not found in current organization.`,
      });
    }

    if (!isAdminOrOps && service.status !== CatalogStatus.ACTIVE) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Service '${identifier}' is not currently active.`,
      });
    }

    return this.mapServiceToDetailResponse(
      service,
      service.category,
      isAdminOrOps ? service.variants : service.variants.filter((v: ServiceVariant) => v.status === CatalogStatus.ACTIVE),
      service.images,
    );
  }

  async getServiceBySlug(
    slug: string,
    organizationId: string,
    isAdminOrOps = false,
  ): Promise<ServiceResponseDto> {
    const service = await this.catalogRepository.findServiceBySlug(slug, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Service with slug '${slug}' not found in current organization.`,
      });
    }

    if (!isAdminOrOps && service.status !== CatalogStatus.ACTIVE) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Service with slug '${slug}' is not currently active.`,
      });
    }

    return this.mapServiceToDetailResponse(
      service,
      service.category,
      isAdminOrOps ? service.variants : service.variants.filter((v: ServiceVariant) => v.status === CatalogStatus.ACTIVE),
      service.images,
    );
  }

  async updateService(
    identifier: string,
    dto: UpdateServiceDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<ServiceResponseDto> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(identifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Service '${identifier}' not found in current organization.`,
      });
    }

    let categoryId: string | undefined = undefined;
    if (dto.categoryId) {
      const cat = await this.catalogRepository.findCategoryByIdOrPublicId(dto.categoryId, organizationId);
      if (!cat) {
        throw new NotFoundException({
          code: CatalogErrorCode.CATEGORY_NOT_FOUND,
          message: `Category '${dto.categoryId}' not found in current organization.`,
        });
      }
      categoryId = cat.id;
    }

    let slug: string | undefined = undefined;
    if (dto.slug || dto.name) {
      slug = slugify(dto.slug || dto.name || service.name);
      if (slug !== service.slug) {
        const duplicate = await this.catalogRepository.findServiceBySlug(slug, organizationId);
        if (duplicate && duplicate.id !== service.id) {
          throw new ConflictException({
            code: CatalogErrorCode.DUPLICATE_SERVICE_SLUG,
            message: `A service with slug '${slug}' already exists in this organization.`,
          });
        }
      }
    }

    const updated = await this.catalogRepository.updateService(service.id, {
      categoryId,
      name: dto.name,
      slug,
      tagline: dto.tagline,
      description: dto.description,
      basePrice: dto.basePrice,
      unit: dto.unit,
      turnaroundHours: dto.turnaroundHours,
      isFeatured: dto.isFeatured,
      status: dto.status,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.SERVICE_UPDATED,
      entityType: 'Service',
      entityId: updated.id,
      metadataJson: { changes: dto },
    });

    const refreshed = await this.catalogRepository.findServiceByIdOrPublicId(updated.id, organizationId);
    return this.mapServiceToDetailResponse(
      refreshed!,
      refreshed!.category,
      refreshed!.variants,
      refreshed!.images,
    );
  }

  async updateServiceStatus(
    identifier: string,
    dto: UpdateServiceStatusDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<ServiceResponseDto> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(identifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Service '${identifier}' not found in current organization.`,
      });
    }

    const updated = await this.catalogRepository.updateService(service.id, {
      status: dto.status,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.SERVICE_STATUS_CHANGED,
      entityType: 'Service',
      entityId: updated.id,
      metadataJson: { previousStatus: service.status, newStatus: dto.status },
    });

    const refreshed = await this.catalogRepository.findServiceByIdOrPublicId(updated.id, organizationId);
    return this.mapServiceToDetailResponse(
      refreshed!,
      refreshed!.category,
      refreshed!.variants,
      refreshed!.images,
    );
  }

  async deleteService(
    identifier: string,
    organizationId: string,
    actorUserId?: string,
  ): Promise<{ message: string; deletedId: string }> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(identifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Service '${identifier}' not found in current organization.`,
      });
    }

    await this.catalogRepository.deleteService(service.id);

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.SERVICE_DELETED,
      entityType: 'Service',
      entityId: service.id,
      metadataJson: { name: service.name, publicId: service.publicId },
    });

    return {
      message: `Service '${service.name}' (${service.publicId}) successfully deleted.`,
      deletedId: service.id,
    };
  }

  // ==========================================================================
  // SERVICE VARIANTS
  // ==========================================================================

  async createVariant(
    serviceIdentifier: string,
    dto: CreateServiceVariantDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<ServiceVariantResponseDto> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(serviceIdentifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Parent service '${serviceIdentifier}' not found in current organization.`,
      });
    }

    let publicId = await this.generateVariantPublicId(organizationId);
    const existing = await this.catalogRepository.findVariantByIdOrPublicId(publicId, organizationId);
    if (existing) {
      publicId = `VAR-${Date.now().toString(36).toUpperCase()}`;
    }

    const variant = await this.catalogRepository.createVariant({
      publicId,
      organizationId,
      serviceId: service.id,
      name: dto.name,
      priceMultiplier: dto.priceMultiplier,
      additionalPrice: dto.additionalPrice,
      description: dto.description,
      turnaroundHours: dto.turnaroundHours,
      status: dto.status ?? CatalogStatus.ACTIVE,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.VARIANT_CREATED,
      entityType: 'ServiceVariant',
      entityId: variant.id,
      metadataJson: { serviceId: service.id, name: variant.name, publicId: variant.publicId },
    });

    return this.mapVariantToResponse(variant);
  }

  async getVariantsByService(
    serviceIdentifier: string,
    organizationId: string,
    isAdminOrOps = false,
  ): Promise<ServiceVariantResponseDto[]> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(serviceIdentifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Parent service '${serviceIdentifier}' not found in current organization.`,
      });
    }

    const variants = await this.catalogRepository.findVariantsByService(
      service.id,
      organizationId,
      isAdminOrOps ? undefined : CatalogStatus.ACTIVE,
    );

    return variants.map((v) => this.mapVariantToResponse(v));
  }

  async updateVariant(
    serviceIdentifier: string,
    variantIdentifier: string,
    dto: UpdateServiceVariantDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<ServiceVariantResponseDto> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(serviceIdentifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Parent service '${serviceIdentifier}' not found in current organization.`,
      });
    }

    const variant = await this.catalogRepository.findVariantByIdOrPublicId(variantIdentifier, organizationId);
    if (!variant || variant.serviceId !== service.id) {
      throw new NotFoundException({
        code: CatalogErrorCode.VARIANT_NOT_FOUND,
        message: `Variant '${variantIdentifier}' not found for service '${serviceIdentifier}'.`,
      });
    }

    const updated = await this.catalogRepository.updateVariant(variant.id, {
      name: dto.name,
      priceMultiplier: dto.priceMultiplier,
      additionalPrice: dto.additionalPrice,
      description: dto.description,
      turnaroundHours: dto.turnaroundHours,
      status: dto.status,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.VARIANT_UPDATED,
      entityType: 'ServiceVariant',
      entityId: updated.id,
      metadataJson: { changes: dto },
    });

    return this.mapVariantToResponse(updated);
  }

  async deleteVariant(
    serviceIdentifier: string,
    variantIdentifier: string,
    organizationId: string,
    actorUserId?: string,
  ): Promise<{ message: string; deletedId: string }> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(serviceIdentifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Parent service '${serviceIdentifier}' not found in current organization.`,
      });
    }

    const variant = await this.catalogRepository.findVariantByIdOrPublicId(variantIdentifier, organizationId);
    if (!variant || variant.serviceId !== service.id) {
      throw new NotFoundException({
        code: CatalogErrorCode.VARIANT_NOT_FOUND,
        message: `Variant '${variantIdentifier}' not found for service '${serviceIdentifier}'.`,
      });
    }

    await this.catalogRepository.deleteVariant(variant.id);

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.VARIANT_DELETED,
      entityType: 'ServiceVariant',
      entityId: variant.id,
      metadataJson: { name: variant.name, publicId: variant.publicId },
    });

    return {
      message: `Variant '${variant.name}' (${variant.publicId}) successfully deleted.`,
      deletedId: variant.id,
    };
  }

  // ==========================================================================
  // SERVICE IMAGES
  // ==========================================================================

  async addServiceImage(
    serviceIdentifier: string,
    dto: CreateServiceImageDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<ServiceImageResponseDto> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(serviceIdentifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Parent service '${serviceIdentifier}' not found in current organization.`,
      });
    }

    const image = await this.catalogRepository.createImage({
      organizationId,
      serviceId: service.id,
      imageUrl: dto.imageUrl,
      altText: dto.altText,
      displayOrder: dto.displayOrder ?? 0,
      isPrimary: dto.isPrimary ?? false,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.IMAGE_ADDED,
      entityType: 'ServiceImage',
      entityId: image.id,
      metadataJson: { serviceId: service.id, isPrimary: image.isPrimary },
    });

    return this.mapImageToResponse(image);
  }

  async getServiceImages(
    serviceIdentifier: string,
    organizationId: string,
  ): Promise<ServiceImageResponseDto[]> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(serviceIdentifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Parent service '${serviceIdentifier}' not found in current organization.`,
      });
    }

    const images = await this.catalogRepository.findImagesByService(service.id, organizationId);
    return images.map((img) => this.mapImageToResponse(img));
  }

  async updateServiceImage(
    serviceIdentifier: string,
    imageId: string,
    dto: UpdateServiceImageDto,
    organizationId: string,
    actorUserId?: string,
  ): Promise<ServiceImageResponseDto> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(serviceIdentifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Parent service '${serviceIdentifier}' not found in current organization.`,
      });
    }

    const image = await this.catalogRepository.findImageById(imageId, organizationId);
    if (!image || image.serviceId !== service.id) {
      throw new NotFoundException({
        code: CatalogErrorCode.IMAGE_NOT_FOUND,
        message: `Image '${imageId}' not found for service '${serviceIdentifier}'.`,
      });
    }

    const updated = await this.catalogRepository.updateImage(image.id, service.id, {
      altText: dto.altText,
      displayOrder: dto.displayOrder,
      isPrimary: dto.isPrimary,
    });

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: dto.isPrimary ? CatalogAuditEventType.IMAGE_PRIMARY_SET : 'IMAGE_UPDATED',
      entityType: 'ServiceImage',
      entityId: updated.id,
      metadataJson: { changes: dto },
    });

    return this.mapImageToResponse(updated);
  }

  async deleteServiceImage(
    serviceIdentifier: string,
    imageId: string,
    organizationId: string,
    actorUserId?: string,
  ): Promise<{ message: string; deletedId: string }> {
    const service = await this.catalogRepository.findServiceByIdOrPublicId(serviceIdentifier, organizationId);
    if (!service) {
      throw new NotFoundException({
        code: CatalogErrorCode.SERVICE_NOT_FOUND,
        message: `Parent service '${serviceIdentifier}' not found in current organization.`,
      });
    }

    const image = await this.catalogRepository.findImageById(imageId, organizationId);
    if (!image || image.serviceId !== service.id) {
      throw new NotFoundException({
        code: CatalogErrorCode.IMAGE_NOT_FOUND,
        message: `Image '${imageId}' not found for service '${serviceIdentifier}'.`,
      });
    }

    await this.catalogRepository.deleteImage(image.id, service.id);

    await this.catalogRepository.createAuditEvent({
      organizationId,
      userId: actorUserId,
      action: CatalogAuditEventType.IMAGE_DELETED,
      entityType: 'ServiceImage',
      entityId: image.id,
      metadataJson: { serviceId: service.id, wasPrimary: image.isPrimary },
    });

    return {
      message: `Image successfully deleted from service.`,
      deletedId: image.id,
    };
  }

  // ==========================================================================
  // RESPONSE MAPPERS
  // ==========================================================================

  private mapCategoryToResponse(category: ServiceCategory, servicesCount = 0): CategoryResponseDto {
    return {
      id: category.id,
      publicId: category.publicId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      iconUrl: category.iconUrl,
      bannerUrl: category.bannerUrl,
      displayOrder: category.displayOrder,
      status: category.status,
      servicesCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private mapVariantToResponse(variant: ServiceVariant): ServiceVariantResponseDto {
    return {
      id: variant.id,
      publicId: variant.publicId,
      serviceId: variant.serviceId,
      name: variant.name,
      priceMultiplier: Number(variant.priceMultiplier),
      additionalPrice: Number(variant.additionalPrice),
      description: variant.description,
      turnaroundHours: variant.turnaroundHours,
      status: variant.status,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }

  private mapImageToResponse(image: ServiceImage): ServiceImageResponseDto {
    return {
      id: image.id,
      serviceId: image.serviceId,
      imageUrl: image.imageUrl,
      altText: image.altText,
      displayOrder: image.displayOrder,
      isPrimary: image.isPrimary,
      createdAt: image.createdAt,
    };
  }

  private mapServiceToSummaryResponse(
    service: Service,
    category?: ServiceCategory,
    images?: ServiceImage[],
  ): ServiceSummaryDto {
    const primaryImg = images?.find((i) => i.isPrimary) || images?.[0] || null;

    return {
      id: service.id,
      publicId: service.publicId,
      categoryId: service.categoryId,
      name: service.name,
      slug: service.slug,
      tagline: service.tagline,
      description: service.description,
      basePrice: Number(service.basePrice),
      unit: service.unit,
      turnaroundHours: service.turnaroundHours,
      isFeatured: service.isFeatured,
      rating: Number(service.rating),
      totalReviews: service.totalReviews,
      status: service.status,
      category: category ? this.mapCategoryToResponse(category) : undefined,
      primaryImage: primaryImg ? this.mapImageToResponse(primaryImg) : null,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  private mapServiceToDetailResponse(
    service: Service,
    category?: ServiceCategory,
    variants: ServiceVariant[] = [],
    images: ServiceImage[] = [],
  ): ServiceDetailResponseDto {
    const summary = this.mapServiceToSummaryResponse(service, category, images);

    return {
      ...summary,
      variants: variants.map((v) => this.mapVariantToResponse(v)),
      images: images.map((i) => this.mapImageToResponse(i)),
    };
  }
}
