import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../admin.repository';
import {
  ProviderAdminQueryDto,
  UpdateProviderAdminDto,
} from '../dto/entity-admin.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminProviderService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async listProviders(orgId: string, query: ProviderAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findProviders(orgId, {
      status: query.status,
      approvalStatus: query.approvalStatus,
      search: query.search,
      skip,
      take: limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProvider(orgId: string, providerId: string) {
    const provider = await this.adminRepo.findProviderById(providerId, orgId);
    if (!provider) {
      throw new NotFoundException({
        code: AdminErrorCode.PROVIDER_NOT_FOUND,
        message: `Provider ${providerId} not found`,
      });
    }
    return provider;
  }

  async updateProvider(
    orgId: string,
    providerId: string,
    dto: UpdateProviderAdminDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const provider = await this.adminRepo.findProviderById(providerId, orgId);
    if (!provider) {
      throw new NotFoundException({
        code: AdminErrorCode.PROVIDER_NOT_FOUND,
        message: `Provider ${providerId} not found`,
      });
    }

    const updated = await this.adminRepo.updateProvider(providerId, orgId, {
      businessName: dto.businessName,
      fullName: dto.fullName,
      phone: dto.phone,
      address: dto.address,
      city: dto.city,
      status: dto.status as any,
      approvalStatus: dto.approvalStatus as any,
    });

    const isApproval = dto.approvalStatus === 'APPROVED';

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: isApproval ? AdminAuditEvent.PROVIDER_VERIFIED : AdminAuditEvent.PROVIDER_UPDATED,
      entityType: 'Provider',
      entityId: providerId,
      metadata: { changes: dto },
      ipHash: ipAddress,
    });

    return updated;
  }

  async getProviderServices(orgId: string, providerId: string) {
    await this.getProvider(orgId, providerId);
    return this.adminRepo.findProviderServices(providerId);
  }

  async getProviderBookings(
    orgId: string,
    providerId: string,
    query: { page?: number; limit?: number },
  ) {
    await this.getProvider(orgId, providerId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findProviderBookings(
      providerId,
      orgId,
      { skip, take: limit },
    );

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProviderEarnings(
    orgId: string,
    providerId: string,
    query: { page?: number; limit?: number },
  ) {
    await this.getProvider(orgId, providerId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findProviderEarnings(
      providerId,
      orgId,
      { skip, take: limit },
    );

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
