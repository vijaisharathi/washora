import { Injectable } from '@nestjs/common';
import {
  AddressStatus,
  Customer,
  CustomerAddress,
  CustomerFavorite,
  CustomerRewardAccount,
  CustomerRewardTransaction,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a customer record by authenticated user ID and organization ID.
   */
  async findCustomerByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  /**
   * Find a customer record by customer UUID or public ID within an organization.
   */
  async findCustomerByIdOrPublicId(
    identifier: string,
    organizationId: string,
  ): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
    });
  }

  /**
   * Update customer profile details.
   */
  async updateCustomerProfile(
    customerId: string,
    organizationId: string,
    data: {
      fullName?: string;
      phone?: string;
      profileImageUrl?: string;
    },
  ): Promise<Customer> {
    return this.prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.profileImageUrl !== undefined ? { profileImageUrl: data.profileImageUrl } : {}),
      },
    });
  }

  /**
   * List customer addresses with sorting (default first, then newest updated).
   */
  async findAddresses(
    customerId: string,
    organizationId: string,
    status: AddressStatus = AddressStatus.ACTIVE,
    skip?: number,
    take?: number,
  ): Promise<CustomerAddress[]> {
    return this.prisma.customerAddress.findMany({
      where: {
        customerId,
        organizationId,
        status,
      },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take,
    });
  }

  /**
   * Count total addresses matching criteria.
   */
  async countAddresses(
    customerId: string,
    organizationId: string,
    status: AddressStatus = AddressStatus.ACTIVE,
  ): Promise<number> {
    return this.prisma.customerAddress.count({
      where: {
        customerId,
        organizationId,
        status,
      },
    });
  }

  /**
   * Find single address by ID strictly scoped to customer and organization.
   */
  async findAddressById(
    addressId: string,
    customerId: string,
    organizationId: string,
  ): Promise<CustomerAddress | null> {
    return this.prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customerId,
        organizationId,
      },
    });
  }

  /**
   * Count active addresses for a customer.
   */
  async countActiveAddresses(
    customerId: string,
    organizationId: string,
  ): Promise<number> {
    return this.prisma.customerAddress.count({
      where: {
        customerId,
        organizationId,
        status: AddressStatus.ACTIVE,
      },
    });
  }

  /**
   * Create address inside a transaction with automatic default rotation.
   */
  async createAddressWithDefaultRotation(
    customerId: string,
    organizationId: string,
    data: {
      label: any;
      recipientName: string;
      recipientPhone: string;
      addressLine1: string;
      addressLine2?: string;
      area: string;
      city: string;
      state: string;
      postalCode: string;
      landmark?: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    },
  ): Promise<CustomerAddress> {
    return this.prisma.$transaction(async (tx) => {
      const activeCount = await tx.customerAddress.count({
        where: { customerId, organizationId, status: AddressStatus.ACTIVE },
      });

      // If it's the first address or explicitly marked as default, make it default
      const shouldBeDefault = activeCount === 0 || data.isDefault === true;

      if (shouldBeDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId, organizationId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.create({
        data: {
          customerId,
          organizationId,
          label: data.label,
          recipientName: data.recipientName,
          recipientPhone: data.recipientPhone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          area: data.area,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          landmark: data.landmark,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: shouldBeDefault,
          status: AddressStatus.ACTIVE,
        },
      });
    });
  }

  /**
   * Update address details with optional default rotation.
   */
  async updateAddressWithDefaultRotation(
    addressId: string,
    customerId: string,
    organizationId: string,
    data: Prisma.CustomerAddressUpdateInput & { isDefault?: boolean },
  ): Promise<CustomerAddress> {
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await tx.customerAddress.updateMany({
          where: { customerId, organizationId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.update({
        where: { id: addressId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    });
  }

  /**
   * Set specific address as default in a transaction.
   */
  async setDefaultAddress(
    addressId: string,
    customerId: string,
    organizationId: string,
  ): Promise<CustomerAddress> {
    return this.prisma.$transaction(async (tx) => {
      await tx.customerAddress.updateMany({
        where: { customerId, organizationId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.customerAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  }

  /**
   * Soft-deactivate address and promote another active address to default if needed.
   */
  async deactivateAddressWithDefaultRotation(
    addressId: string,
    customerId: string,
    organizationId: string,
  ): Promise<CustomerAddress> {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.customerAddress.findUnique({
        where: { id: addressId },
      });

      const wasDefault = target?.isDefault ?? false;

      const deactivated = await tx.customerAddress.update({
        where: { id: addressId },
        data: {
          status: AddressStatus.INACTIVE,
          isDefault: false,
        },
      });

      if (wasDefault) {
        // Find next newest active address
        const nextActive = await tx.customerAddress.findFirst({
          where: {
            customerId,
            organizationId,
            status: AddressStatus.ACTIVE,
          },
          orderBy: { updatedAt: 'desc' },
        });

        if (nextActive) {
          await tx.customerAddress.update({
            where: { id: nextActive.id },
            data: { isDefault: true },
          });
        }
      }

      return deactivated;
    });
  }

  /**
   * List customer favorites with service details.
   */
  async findFavorites(
    customerId: string,
    organizationId: string,
  ) {
    return this.prisma.customerFavorite.findMany({
      where: {
        customerId,
        organizationId,
      },
      include: {
        service: {
          select: {
            id: true,
            publicId: true,
            name: true,
            slug: true,
            tagline: true,
            description: true,
            basePrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find a service by UUID or public ID within an organization to ensure tenant alignment.
   */
  async findServiceByIdOrPublicId(
    identifier: string,
    organizationId: string,
  ): Promise<{ id: string; organizationId: string; status: string } | null> {
    return this.prisma.service.findFirst({
      where: {
        organizationId,
        OR: [{ id: identifier }, { publicId: identifier }],
      },
      select: {
        id: true,
        organizationId: true,
        status: true,
      },
    });
  }

  /**
   * Add service to customer favorites idempotently.
   */
  async addFavorite(
    customerId: string,
    organizationId: string,
    serviceId: string,
  ): Promise<CustomerFavorite> {
    return this.prisma.customerFavorite.upsert({
      where: {
        customerId_serviceId: {
          customerId,
          serviceId,
        },
      },
      update: {},
      create: {
        customerId,
        organizationId,
        serviceId,
      },
    });
  }

  /**
   * Remove service from customer favorites.
   */
  async removeFavorite(
    customerId: string,
    organizationId: string,
    serviceId: string,
  ): Promise<boolean> {
    const favorite = await this.prisma.customerFavorite.findUnique({
      where: {
        customerId_serviceId: {
          customerId,
          serviceId,
        },
      },
    });

    if (!favorite) {
      return false;
    }

    await this.prisma.customerFavorite.delete({
      where: {
        customerId_serviceId: {
          customerId,
          serviceId,
        },
      },
    });

    return true;
  }

  /**
   * Get or lazily create a customer reward account in a transaction.
   */
  async findOrCreateRewardAccount(
    customerId: string,
    organizationId: string,
  ): Promise<CustomerRewardAccount> {
    const existing = await this.prisma.customerRewardAccount.findUnique({
      where: { customerId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.customerRewardAccount.create({
      data: {
        customerId,
        organizationId,
        pointsBalance: 0,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
      },
    });
  }

  /**
   * List customer reward transactions with pagination.
   */
  async findRewardTransactions(
    customerId: string,
    organizationId: string,
    skip?: number,
    take?: number,
    search?: string,
  ): Promise<CustomerRewardTransaction[]> {
    return this.prisma.customerRewardTransaction.findMany({
      where: {
        customerId,
        organizationId,
        ...(search
          ? {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  /**
   * Count total reward transactions.
   */
  async countRewardTransactions(
    customerId: string,
    organizationId: string,
    search?: string,
  ): Promise<number> {
    return this.prisma.customerRewardTransaction.count({
      where: {
        customerId,
        organizationId,
        ...(search
          ? {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
    });
  }

  /**
   * Record an audit event in the database.
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
