import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddressStatus, Customer, UserStatus } from '@prisma/client';
import { CustomerRepository } from './customer.repository';
import {
  CreateAddressDto,
  CustomerAddressQueryDto,
  CustomerAddressResponseDto,
  CustomerFavoriteResponseDto,
  CustomerProfileResponseDto,
  CustomerRewardAccountResponseDto,
  CustomerRewardQueryDto,
  CustomerRewardTransactionResponseDto,
  UpdateAddressDto,
  UpdateCustomerProfileDto,
} from './dto';
import {
  CustomerAuditEventType,
  CustomerErrorCode,
} from './types/customer.types';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  /**
   * Helper to resolve customer by authenticated user ID and organization context,
   * enforcing account lifecycle status checks.
   */
  async resolveCustomer(
    userId: string,
    organizationId: string,
  ): Promise<Customer> {
    const customer = await this.customerRepository.findCustomerByUserAndOrg(
      userId,
      organizationId,
    );

    if (!customer) {
      throw new NotFoundException({
        code: CustomerErrorCode.CUSTOMER_NOT_FOUND,
        message: 'Customer profile not found for active user in current organization',
      });
    }

    if (customer.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: CustomerErrorCode.CUSTOMER_SUSPENDED,
        message: 'Customer account is suspended. Action is not permitted.',
      });
    }

    if (customer.status === UserStatus.INACTIVE) {
      throw new ForbiddenException({
        code: CustomerErrorCode.CUSTOMER_INACTIVE,
        message: 'Customer account is inactive. Action is not permitted.',
      });
    }

    return customer;
  }

  /**
   * Get authenticated customer profile.
   */
  async getProfile(
    userId: string,
    organizationId: string,
  ): Promise<CustomerProfileResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    return {
      id: customer.publicId,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      profileImageUrl: customer.profileImageUrl,
      membershipTier: customer.membershipTier,
      status: customer.status,
      joinedAt: customer.joinedAt,
      updatedAt: customer.updatedAt,
    };
  }

  /**
   * Update customer profile.
   */
  async updateProfile(
    userId: string,
    organizationId: string,
    dto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const updated = await this.customerRepository.updateCustomerProfile(
      customer.id,
      organizationId,
      {
        fullName: dto.fullName?.trim(),
        phone: dto.phone?.trim(),
        profileImageUrl: dto.profileImageUrl?.trim(),
      },
    );

    await this.customerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'UPDATE_PROFILE',
      entityType: 'Customer',
      entityId: customer.id,
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
      membershipTier: updated.membershipTier,
      status: updated.status,
      joinedAt: updated.joinedAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * List customer addresses.
   */
  async getAddresses(
    userId: string,
    organizationId: string,
    query: CustomerAddressQueryDto,
  ): Promise<{
    items: CustomerAddressResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const { skip, take, page, limit, status } = query;

    const [addresses, total] = await Promise.all([
      this.customerRepository.findAddresses(
        customer.id,
        organizationId,
        status ?? AddressStatus.ACTIVE,
        skip,
        take,
      ),
      this.customerRepository.countAddresses(
        customer.id,
        organizationId,
        status ?? AddressStatus.ACTIVE,
      ),
    ]);

    const items: CustomerAddressResponseDto[] = addresses.map((addr) => ({
      id: addr.id,
      customerId: customer.publicId,
      label: addr.label,
      recipientName: addr.recipientName,
      recipientPhone: addr.recipientPhone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      landmark: addr.landmark,
      latitude: addr.latitude ? Number(addr.latitude) : null,
      longitude: addr.longitude ? Number(addr.longitude) : null,
      isDefault: addr.isDefault,
      status: addr.status,
      createdAt: addr.createdAt,
      updatedAt: addr.updatedAt,
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

  /**
   * Create a new address for the customer.
   */
  async createAddress(
    userId: string,
    organizationId: string,
    dto: CreateAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    // Validate coordinate pair
    if (
      (dto.latitude !== undefined && dto.longitude === undefined) ||
      (dto.latitude === undefined && dto.longitude !== undefined)
    ) {
      throw new BadRequestException({
        code: CustomerErrorCode.INVALID_COORDINATES,
        message: 'Both latitude and longitude must be provided together',
      });
    }

    const created =
      await this.customerRepository.createAddressWithDefaultRotation(
        customer.id,
        organizationId,
        {
          label: dto.label,
          recipientName: dto.recipientName.trim(),
          recipientPhone: dto.recipientPhone.trim(),
          addressLine1: dto.addressLine1.trim(),
          addressLine2: dto.addressLine2?.trim(),
          area: dto.area.trim(),
          city: dto.city.trim(),
          state: dto.state.trim(),
          postalCode: dto.postalCode.trim(),
          landmark: dto.landmark?.trim(),
          latitude: dto.latitude,
          longitude: dto.longitude,
          isDefault: dto.isDefault,
        },
      );

    await this.customerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'CREATE_ADDRESS',
      entityType: 'CustomerAddress',
      entityId: created.id,
      metadataJson: {
        isDefault: created.isDefault,
        label: created.label,
      },
    });

    return {
      id: created.id,
      customerId: customer.publicId,
      label: created.label,
      recipientName: created.recipientName,
      recipientPhone: created.recipientPhone,
      addressLine1: created.addressLine1,
      addressLine2: created.addressLine2,
      area: created.area,
      city: created.city,
      state: created.state,
      postalCode: created.postalCode,
      landmark: created.landmark,
      latitude: created.latitude ? Number(created.latitude) : null,
      longitude: created.longitude ? Number(created.longitude) : null,
      isDefault: created.isDefault,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  /**
   * Get specific address by ID.
   */
  async getAddress(
    userId: string,
    organizationId: string,
    addressId: string,
  ): Promise<CustomerAddressResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const address = await this.customerRepository.findAddressById(
      addressId,
      customer.id,
      organizationId,
    );

    if (!address) {
      throw new NotFoundException({
        code: CustomerErrorCode.ADDRESS_NOT_FOUND,
        message: 'Address not found for customer',
      });
    }

    return {
      id: address.id,
      customerId: customer.publicId,
      label: address.label,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      area: address.area,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      landmark: address.landmark,
      latitude: address.latitude ? Number(address.latitude) : null,
      longitude: address.longitude ? Number(address.longitude) : null,
      isDefault: address.isDefault,
      status: address.status,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  /**
   * Update existing address.
   */
  async updateAddress(
    userId: string,
    organizationId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const existing = await this.customerRepository.findAddressById(
      addressId,
      customer.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundException({
        code: CustomerErrorCode.ADDRESS_NOT_FOUND,
        message: 'Address not found for customer',
      });
    }

    if (
      (dto.latitude !== undefined && dto.longitude === undefined && existing.longitude === null) ||
      (dto.longitude !== undefined && dto.latitude === undefined && existing.latitude === null)
    ) {
      throw new BadRequestException({
        code: CustomerErrorCode.INVALID_COORDINATES,
        message: 'Both latitude and longitude must be provided together',
      });
    }

    const updated =
      await this.customerRepository.updateAddressWithDefaultRotation(
        addressId,
        customer.id,
        organizationId,
        {
          ...(dto.label !== undefined ? { label: dto.label } : {}),
          ...(dto.recipientName !== undefined
            ? { recipientName: dto.recipientName.trim() }
            : {}),
          ...(dto.recipientPhone !== undefined
            ? { recipientPhone: dto.recipientPhone.trim() }
            : {}),
          ...(dto.addressLine1 !== undefined
            ? { addressLine1: dto.addressLine1.trim() }
            : {}),
          ...(dto.addressLine2 !== undefined
            ? { addressLine2: dto.addressLine2?.trim() }
            : {}),
          ...(dto.area !== undefined ? { area: dto.area.trim() } : {}),
          ...(dto.city !== undefined ? { city: dto.city.trim() } : {}),
          ...(dto.state !== undefined ? { state: dto.state.trim() } : {}),
          ...(dto.postalCode !== undefined
            ? { postalCode: dto.postalCode.trim() }
            : {}),
          ...(dto.landmark !== undefined
            ? { landmark: dto.landmark?.trim() }
            : {}),
          ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
          ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
          isDefault: dto.isDefault,
        },
      );

    await this.customerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'UPDATE_ADDRESS',
      entityType: 'CustomerAddress',
      entityId: addressId,
      metadataJson: {
        updatedFields: Object.keys(dto),
      },
    });

    if (dto.isDefault === true && !existing.isDefault) {
      await this.customerRepository.createAuditEvent({
        organizationId,
        userId,
        action: 'SET_DEFAULT_ADDRESS',
        entityType: 'CustomerAddress',
        entityId: addressId,
      });
    }

    return {
      id: updated.id,
      customerId: customer.publicId,
      label: updated.label,
      recipientName: updated.recipientName,
      recipientPhone: updated.recipientPhone,
      addressLine1: updated.addressLine1,
      addressLine2: updated.addressLine2,
      area: updated.area,
      city: updated.city,
      state: updated.state,
      postalCode: updated.postalCode,
      landmark: updated.landmark,
      latitude: updated.latitude ? Number(updated.latitude) : null,
      longitude: updated.longitude ? Number(updated.longitude) : null,
      isDefault: updated.isDefault,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Explicitly set address as default.
   */
  async setDefaultAddress(
    userId: string,
    organizationId: string,
    addressId: string,
  ): Promise<CustomerAddressResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const address = await this.customerRepository.findAddressById(
      addressId,
      customer.id,
      organizationId,
    );

    if (!address || address.status !== AddressStatus.ACTIVE) {
      throw new NotFoundException({
        code: CustomerErrorCode.ADDRESS_NOT_FOUND,
        message: 'Active address not found for customer',
      });
    }

    const updated = await this.customerRepository.setDefaultAddress(
      addressId,
      customer.id,
      organizationId,
    );

    await this.customerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'SET_DEFAULT_ADDRESS',
      entityType: 'CustomerAddress',
      entityId: addressId,
    });

    return {
      id: updated.id,
      customerId: customer.publicId,
      label: updated.label,
      recipientName: updated.recipientName,
      recipientPhone: updated.recipientPhone,
      addressLine1: updated.addressLine1,
      addressLine2: updated.addressLine2,
      area: updated.area,
      city: updated.city,
      state: updated.state,
      postalCode: updated.postalCode,
      landmark: updated.landmark,
      latitude: updated.latitude ? Number(updated.latitude) : null,
      longitude: updated.longitude ? Number(updated.longitude) : null,
      isDefault: updated.isDefault,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Soft-deactivate an address and manage default rotation.
   */
  async deleteAddress(
    userId: string,
    organizationId: string,
    addressId: string,
  ): Promise<{ success: boolean; message: string }> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const address = await this.customerRepository.findAddressById(
      addressId,
      customer.id,
      organizationId,
    );

    if (!address) {
      throw new NotFoundException({
        code: CustomerErrorCode.ADDRESS_NOT_FOUND,
        message: 'Address not found for customer',
      });
    }

    await this.customerRepository.deactivateAddressWithDefaultRotation(
      addressId,
      customer.id,
      organizationId,
    );

    await this.customerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'DEACTIVATE_ADDRESS',
      entityType: 'CustomerAddress',
      entityId: addressId,
    });

    return {
      success: true,
      message: 'Address successfully deactivated',
    };
  }

  /**
   * List customer favorites.
   */
  async getFavorites(
    userId: string,
    organizationId: string,
  ): Promise<CustomerFavoriteResponseDto[]> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const favorites = await this.customerRepository.findFavorites(
      customer.id,
      organizationId,
    );

    return favorites.map((fav) => ({
      id: fav.id,
      serviceId: fav.serviceId,
      service: {
        id: fav.service.id,
        publicId: fav.service.publicId,
        name: fav.service.name,
        slug: fav.service.slug,
        tagline: fav.service.tagline,
        description: fav.service.description,
        basePrice: Number(fav.service.basePrice),
        imageUrl: null,
      },
      createdAt: fav.createdAt,
    }));
  }

  /**
   * Add service to customer favorites.
   */
  async addFavorite(
    userId: string,
    organizationId: string,
    serviceIdentifier: string,
  ): Promise<CustomerFavoriteResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const service = await this.customerRepository.findServiceByIdOrPublicId(
      serviceIdentifier,
      organizationId,
    );

    if (!service) {
      throw new NotFoundException({
        code: CustomerErrorCode.SERVICE_NOT_FOUND,
        message: 'Service not found in current organization context',
      });
    }

    const favorite = await this.customerRepository.addFavorite(
      customer.id,
      organizationId,
      service.id,
    );

    await this.customerRepository.createAuditEvent({
      organizationId,
      userId,
      action: 'ADD_FAVORITE',
      entityType: 'CustomerFavorite',
      entityId: favorite.id,
      metadataJson: {
        serviceId: service.id,
      },
    });

    const favoritesList = await this.customerRepository.findFavorites(
      customer.id,
      organizationId,
    );

    const target = favoritesList.find((f) => f.serviceId === service.id);

    return {
      id: favorite.id,
      serviceId: service.id,
      service: {
        id: target?.service.id ?? service.id,
        publicId: target?.service.publicId ?? '',
        name: target?.service.name ?? '',
        slug: target?.service.slug ?? '',
        tagline: target?.service.tagline ?? null,
        description: target?.service.description ?? null,
        basePrice: target?.service.basePrice ? Number(target.service.basePrice) : 0,
        imageUrl: null,
      },
      createdAt: favorite.createdAt,
    };
  }

  /**
   * Remove service from customer favorites.
   */
  async removeFavorite(
    userId: string,
    organizationId: string,
    serviceIdentifier: string,
  ): Promise<{ success: boolean; message: string }> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const service = await this.customerRepository.findServiceByIdOrPublicId(
      serviceIdentifier,
      organizationId,
    );

    if (service) {
      await this.customerRepository.removeFavorite(
        customer.id,
        organizationId,
        service.id,
      );

      await this.customerRepository.createAuditEvent({
        organizationId,
        userId,
        action: 'REMOVE_FAVORITE',
        entityType: 'CustomerFavorite',
        entityId: service.id,
      });
    }

    return {
      success: true,
      message: 'Service removed from favorites',
    };
  }

  /**
   * Get customer rewards account.
   */
  async getRewards(
    userId: string,
    organizationId: string,
  ): Promise<CustomerRewardAccountResponseDto> {
    const customer = await this.resolveCustomer(userId, organizationId);

    const account = await this.customerRepository.findOrCreateRewardAccount(
      customer.id,
      organizationId,
    );

    return {
      id: account.id,
      pointsBalance: account.pointsBalance,
      lifetimeEarned: account.lifetimeEarned,
      lifetimeRedeemed: account.lifetimeRedeemed,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  /**
   * List customer reward transactions.
   */
  async getRewardTransactions(
    userId: string,
    organizationId: string,
    query: CustomerRewardQueryDto,
  ): Promise<{
    items: CustomerRewardTransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const customer = await this.resolveCustomer(userId, organizationId);
    const { skip, take, page, limit, search } = query;

    const [transactions, total] = await Promise.all([
      this.customerRepository.findRewardTransactions(
        customer.id,
        organizationId,
        skip,
        take,
        search,
      ),
      this.customerRepository.countRewardTransactions(
        customer.id,
        organizationId,
        search,
      ),
    ]);

    const items: CustomerRewardTransactionResponseDto[] = transactions.map(
      (tx) => ({
        id: tx.id,
        type: tx.type,
        points: tx.points,
        balanceAfter: tx.balanceAfter,
        description: tx.description,
        bookingId: tx.bookingId,
        createdAt: tx.createdAt,
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
}
