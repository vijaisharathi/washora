import { Injectable } from '@nestjs/common';
import { CatalogStatus, Prisma, Service, ServiceCategory, ServiceImage, ServiceVariant } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // CATEGORIES
  // ==========================================================================

  async getCategoryCount(organizationId: string): Promise<number> {
    return this.prisma.serviceCategory.count({
      where: { organizationId },
    });
  }

  async findCategoryByIdOrPublicId(
    identifier: string,
    organizationId: string,
  ): Promise<ServiceCategory | null> {
    return this.prisma.serviceCategory.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
    });
  }

  async findCategoryBySlug(
    slug: string,
    organizationId: string,
  ): Promise<ServiceCategory | null> {
    return this.prisma.serviceCategory.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug,
        },
      },
    });
  }

  async findCategories(
    organizationId: string,
    options: {
      status?: CatalogStatus;
      search?: string;
      skip?: number;
      take?: number;
    },
  ): Promise<{ items: ServiceCategory[]; total: number }> {
    const where: Prisma.ServiceCategoryWhereInput = {
      organizationId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { description: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.serviceCategory.count({ where }),
      this.prisma.serviceCategory.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        skip: options.skip,
        take: options.take,
      }),
    ]);

    return { items, total };
  }

  async createCategory(data: {
    publicId: string;
    organizationId: string;
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    bannerUrl?: string;
    displayOrder?: number;
    status?: CatalogStatus;
  }): Promise<ServiceCategory> {
    return this.prisma.serviceCategory.create({
      data: {
        publicId: data.publicId,
        organizationId: data.organizationId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        iconUrl: data.iconUrl,
        bannerUrl: data.bannerUrl,
        displayOrder: data.displayOrder ?? 0,
        status: data.status ?? CatalogStatus.ACTIVE,
      },
    });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      iconUrl?: string | null;
      bannerUrl?: string | null;
      displayOrder?: number;
      status?: CatalogStatus;
    },
  ): Promise<ServiceCategory> {
    return this.prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.iconUrl !== undefined ? { iconUrl: data.iconUrl } : {}),
        ...(data.bannerUrl !== undefined ? { bannerUrl: data.bannerUrl } : {}),
        ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
  }

  async deleteCategory(id: string): Promise<ServiceCategory> {
    return this.prisma.serviceCategory.delete({
      where: { id },
    });
  }

  async countServicesInCategory(
    categoryId: string,
    organizationId: string,
    status?: CatalogStatus,
  ): Promise<number> {
    return this.prisma.service.count({
      where: {
        categoryId,
        organizationId,
        ...(status ? { status } : {}),
      },
    });
  }

  // ==========================================================================
  // SERVICES
  // ==========================================================================

  async getServiceCount(organizationId: string): Promise<number> {
    return this.prisma.service.count({
      where: { organizationId },
    });
  }

  async findServiceByIdOrPublicId(
    identifier: string,
    organizationId: string,
  ) {
    return this.prisma.service.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
      include: {
        category: true,
        variants: {
          orderBy: [{ additionalPrice: 'asc' }, { name: 'asc' }],
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
      },
    });
  }

  async findServiceBySlug(
    slug: string,
    organizationId: string,
  ) {
    return this.prisma.service.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug,
        },
      },
      include: {
        category: true,
        variants: {
          orderBy: [{ additionalPrice: 'asc' }, { name: 'asc' }],
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
      },
    });
  }

  async findServices(
    organizationId: string,
    options: {
      categoryId?: string;
      status?: CatalogStatus;
      isFeatured?: boolean;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      skip?: number;
      take?: number;
    },
  ) {
    const where: Prisma.ServiceWhereInput = {
      organizationId,
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.isFeatured !== undefined ? { isFeatured: options.isFeatured } : {}),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { tagline: { contains: options.search, mode: 'insensitive' } },
              { description: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(options.minPrice !== undefined || options.maxPrice !== undefined
        ? {
            basePrice: {
              ...(options.minPrice !== undefined ? { gte: new Prisma.Decimal(options.minPrice) } : {}),
              ...(options.maxPrice !== undefined ? { lte: new Prisma.Decimal(options.maxPrice) } : {}),
            },
          }
        : {}),
    };

    let orderBy: Prisma.ServiceOrderByWithRelationInput[] = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (options.sortBy === 'price') {
      orderBy = [{ basePrice: options.sortOrder ?? 'asc' }];
    } else if (options.sortBy === 'name') {
      orderBy = [{ name: options.sortOrder ?? 'asc' }];
    } else if (options.sortBy === 'rating') {
      orderBy = [{ rating: options.sortOrder ?? 'desc' }];
    } else if (options.sortBy === 'turnaroundHours') {
      orderBy = [{ turnaroundHours: options.sortOrder ?? 'asc' }];
    }

    const [total, items] = await Promise.all([
      this.prisma.service.count({ where }),
      this.prisma.service.findMany({
        where,
        orderBy,
        skip: options.skip,
        take: options.take,
        include: {
          category: true,
          variants: {
            where: options.status === CatalogStatus.ACTIVE ? { status: CatalogStatus.ACTIVE } : undefined,
            orderBy: [{ additionalPrice: 'asc' }],
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
          },
        },
      }),
    ]);

    return { items, total };
  }

  async createService(data: {
    publicId: string;
    organizationId: string;
    categoryId: string;
    name: string;
    slug: string;
    tagline?: string;
    description: string;
    basePrice: number;
    unit?: string;
    turnaroundHours?: number;
    isFeatured?: boolean;
    status?: CatalogStatus;
  }): Promise<Service> {
    return this.prisma.service.create({
      data: {
        publicId: data.publicId,
        organizationId: data.organizationId,
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        basePrice: new Prisma.Decimal(data.basePrice),
        unit: data.unit ?? 'kg',
        turnaroundHours: data.turnaroundHours ?? 24,
        isFeatured: data.isFeatured ?? false,
        status: data.status ?? CatalogStatus.ACTIVE,
      },
    });
  }

  async updateService(
    id: string,
    data: {
      categoryId?: string;
      name?: string;
      slug?: string;
      tagline?: string | null;
      description?: string;
      basePrice?: number;
      unit?: string;
      turnaroundHours?: number;
      isFeatured?: boolean;
      status?: CatalogStatus;
    },
  ): Promise<Service> {
    return this.prisma.service.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.tagline !== undefined ? { tagline: data.tagline } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.basePrice !== undefined ? { basePrice: new Prisma.Decimal(data.basePrice) } : {}),
        ...(data.unit !== undefined ? { unit: data.unit } : {}),
        ...(data.turnaroundHours !== undefined ? { turnaroundHours: data.turnaroundHours } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
  }

  async deleteService(id: string): Promise<Service> {
    return this.prisma.service.delete({
      where: { id },
    });
  }

  // ==========================================================================
  // SERVICE VARIANTS
  // ==========================================================================

  async getVariantCount(organizationId: string): Promise<number> {
    return this.prisma.serviceVariant.count({
      where: { organizationId },
    });
  }

  async findVariantByIdOrPublicId(
    identifier: string,
    organizationId: string,
  ): Promise<ServiceVariant | null> {
    return this.prisma.serviceVariant.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
    });
  }

  async findVariantsByService(
    serviceId: string,
    organizationId: string,
    status?: CatalogStatus,
  ): Promise<ServiceVariant[]> {
    return this.prisma.serviceVariant.findMany({
      where: {
        serviceId,
        organizationId,
        ...(status ? { status } : {}),
      },
      orderBy: [{ additionalPrice: 'asc' }, { name: 'asc' }],
    });
  }

  async createVariant(data: {
    publicId: string;
    organizationId: string;
    serviceId: string;
    name: string;
    priceMultiplier?: number;
    additionalPrice?: number;
    description?: string;
    turnaroundHours?: number;
    status?: CatalogStatus;
  }): Promise<ServiceVariant> {
    return this.prisma.serviceVariant.create({
      data: {
        publicId: data.publicId,
        organizationId: data.organizationId,
        serviceId: data.serviceId,
        name: data.name,
        priceMultiplier: new Prisma.Decimal(data.priceMultiplier ?? 1.0),
        additionalPrice: new Prisma.Decimal(data.additionalPrice ?? 0.0),
        description: data.description,
        turnaroundHours: data.turnaroundHours,
        status: data.status ?? CatalogStatus.ACTIVE,
      },
    });
  }

  async updateVariant(
    id: string,
    data: {
      name?: string;
      priceMultiplier?: number;
      additionalPrice?: number;
      description?: string | null;
      turnaroundHours?: number | null;
      status?: CatalogStatus;
    },
  ): Promise<ServiceVariant> {
    return this.prisma.serviceVariant.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.priceMultiplier !== undefined ? { priceMultiplier: new Prisma.Decimal(data.priceMultiplier) } : {}),
        ...(data.additionalPrice !== undefined ? { additionalPrice: new Prisma.Decimal(data.additionalPrice) } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.turnaroundHours !== undefined ? { turnaroundHours: data.turnaroundHours } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
  }

  async deleteVariant(id: string): Promise<ServiceVariant> {
    return this.prisma.serviceVariant.delete({
      where: { id },
    });
  }

  // ==========================================================================
  // SERVICE IMAGES (With Primary Image Invariant & Transactional Handling)
  // ==========================================================================

  async findImageById(
    imageId: string,
    organizationId: string,
  ): Promise<ServiceImage | null> {
    return this.prisma.serviceImage.findFirst({
      where: { id: imageId, organizationId },
    });
  }

  async findImagesByService(
    serviceId: string,
    organizationId: string,
  ): Promise<ServiceImage[]> {
    return this.prisma.serviceImage.findMany({
      where: { serviceId, organizationId },
      orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
    });
  }

  async createImage(data: {
    organizationId: string;
    serviceId: string;
    imageUrl: string;
    altText?: string;
    displayOrder?: number;
    isPrimary?: boolean;
  }): Promise<ServiceImage> {
    return this.prisma.$transaction(async (tx) => {
      // If setting isPrimary = true, unset other primaries for this service
      if (data.isPrimary) {
        await tx.serviceImage.updateMany({
          where: { serviceId: data.serviceId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return tx.serviceImage.create({
        data: {
          organizationId: data.organizationId,
          serviceId: data.serviceId,
          imageUrl: data.imageUrl,
          altText: data.altText,
          displayOrder: data.displayOrder ?? 0,
          isPrimary: data.isPrimary ?? false,
        },
      });
    });
  }

  async updateImage(
    id: string,
    serviceId: string,
    data: {
      altText?: string | null;
      displayOrder?: number;
      isPrimary?: boolean;
    },
  ): Promise<ServiceImage> {
    return this.prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.serviceImage.updateMany({
          where: { serviceId, isPrimary: true, id: { not: id } },
          data: { isPrimary: false },
        });
      }

      return tx.serviceImage.update({
        where: { id },
        data: {
          ...(data.altText !== undefined ? { altText: data.altText } : {}),
          ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
          ...(data.isPrimary !== undefined ? { isPrimary: data.isPrimary } : {}),
        },
      });
    });
  }

  async deleteImage(
    id: string,
    serviceId: string,
  ): Promise<ServiceImage> {
    return this.prisma.$transaction(async (tx) => {
      const deletedImage = await tx.serviceImage.delete({
        where: { id },
      });

      // If the deleted image was primary, promote the lowest displayOrder image remaining
      if (deletedImage.isPrimary) {
        const nextPrimary = await tx.serviceImage.findFirst({
          where: { serviceId },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
        });

        if (nextPrimary) {
          await tx.serviceImage.update({
            where: { id: nextPrimary.id },
            data: { isPrimary: true },
          });
        }
      }

      return deletedImage;
    });
  }

  // ==========================================================================
  // AUDIT LOGGING
  // ==========================================================================

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
