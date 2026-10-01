import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../admin.repository';
import {
  DeliveryPartnerAdminQueryDto,
  UpdateDeliveryPartnerAdminDto,
} from '../dto/entity-admin.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminDeliveryService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async listDeliveryPartners(orgId: string, query: DeliveryPartnerAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findDeliveryPartners(orgId, {
      status: query.status,
      approvalStatus: query.approvalStatus,
      vehicleType: query.vehicleType,
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

  async getDeliveryPartner(orgId: string, partnerId: string) {
    const partner = await this.adminRepo.findDeliveryPartnerById(partnerId, orgId);
    if (!partner) {
      throw new NotFoundException({
        code: AdminErrorCode.DELIVERY_PARTNER_NOT_FOUND,
        message: `Delivery partner ${partnerId} not found`,
      });
    }
    return partner;
  }

  async updateDeliveryPartner(
    orgId: string,
    partnerId: string,
    dto: UpdateDeliveryPartnerAdminDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const partner = await this.adminRepo.findDeliveryPartnerById(partnerId, orgId);
    if (!partner) {
      throw new NotFoundException({
        code: AdminErrorCode.DELIVERY_PARTNER_NOT_FOUND,
        message: `Delivery partner ${partnerId} not found`,
      });
    }

    const updated = await this.adminRepo.updateDeliveryPartner(partnerId, orgId, {
      fullName: dto.fullName,
      phone: dto.phone,
      vehicleType: dto.vehicleType as any,
      vehicleNumber: dto.vehicleNumber,
      city: dto.city,
      status: dto.status as any,
      approvalStatus: dto.approvalStatus as any,
    });

    const isApproval = dto.approvalStatus === 'APPROVED';

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: isApproval
        ? AdminAuditEvent.DELIVERY_PARTNER_VERIFIED
        : AdminAuditEvent.DELIVERY_PARTNER_UPDATED,
      entityType: 'DeliveryPartner',
      entityId: partnerId,
      metadata: { changes: dto },
      ipHash: ipAddress,
    });

    return updated;
  }

  async getDeliveryPartnerAssignments(
    orgId: string,
    partnerId: string,
    query: { page?: number; limit?: number },
  ) {
    await this.getDeliveryPartner(orgId, partnerId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findDeliveryPartnerAssignments(
      partnerId,
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

  async getDeliveryPartnerEarnings(
    orgId: string,
    partnerId: string,
    query: { page?: number; limit?: number },
  ) {
    await this.getDeliveryPartner(orgId, partnerId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findDeliveryPartnerEarnings(
      partnerId,
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
