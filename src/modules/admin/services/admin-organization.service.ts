import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../admin.repository';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminOrganizationService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async getOrganization(orgId: string) {
    const org = await this.adminRepo.findOrganizationById(orgId);
    if (!org) {
      throw new NotFoundException({
        code: AdminErrorCode.ORGANIZATION_NOT_FOUND,
        message: `Organization ${orgId} not found`,
      });
    }
    return org;
  }

  async updateOrganization(
    orgId: string,
    dto: UpdateOrganizationDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const existing = await this.adminRepo.findOrganizationById(orgId);
    if (!existing) {
      throw new NotFoundException({
        code: AdminErrorCode.ORGANIZATION_NOT_FOUND,
        message: `Organization ${orgId} not found`,
      });
    }

    const updated = await this.adminRepo.updateOrganization(orgId, {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      city: dto.city,
      state: dto.state,
    });


    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.ORG_SETTINGS_UPDATED,
      entityType: 'Organization',
      entityId: orgId,
      metadata: { changes: dto },
      ipHash: ipAddress,
    });

    return updated;
  }
}
