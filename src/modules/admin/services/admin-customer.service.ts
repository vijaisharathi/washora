import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../admin.repository';
import {
  CustomerAdminQueryDto,
  UpdateCustomerAdminDto,
} from '../dto/entity-admin.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminCustomerService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async listCustomers(orgId: string, query: CustomerAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findCustomers(orgId, {
      status: query.status,
      tier: query.tier,
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

  async getCustomer(orgId: string, customerId: string) {
    const customer = await this.adminRepo.findCustomerById(customerId, orgId);
    if (!customer) {
      throw new NotFoundException({
        code: AdminErrorCode.CUSTOMER_NOT_FOUND,
        message: `Customer ${customerId} not found`,
      });
    }
    return customer;
  }

  async updateCustomer(
    orgId: string,
    customerId: string,
    dto: UpdateCustomerAdminDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const customer = await this.adminRepo.findCustomerById(customerId, orgId);
    if (!customer) {
      throw new NotFoundException({
        code: AdminErrorCode.CUSTOMER_NOT_FOUND,
        message: `Customer ${customerId} not found`,
      });
    }

    const updateData: any = {};
    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.tier) updateData.membershipTier = dto.tier as any;
    if (dto.status) updateData.status = dto.status;

    const updated = await this.adminRepo.updateCustomer(customerId, orgId, updateData);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.CUSTOMER_UPDATED,
      entityType: 'Customer',
      entityId: customerId,
      metadata: { changes: dto },
      ipHash: ipAddress,
    });

    return updated;
  }

  async getCustomerBookings(
    orgId: string,
    customerId: string,
    query: { page?: number; limit?: number },
  ) {
    await this.getCustomer(orgId, customerId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findCustomerBookings(
      customerId,
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

  async getCustomerPayments(
    orgId: string,
    customerId: string,
    query: { page?: number; limit?: number },
  ) {
    await this.getCustomer(orgId, customerId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findCustomerPayments(
      customerId,
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

  async getCustomerAddresses(orgId: string, customerId: string) {
    await this.getCustomer(orgId, customerId);
    return this.adminRepo.findCustomerAddresses(customerId);
  }
}
