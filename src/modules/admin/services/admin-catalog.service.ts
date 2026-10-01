import { Injectable } from '@nestjs/common';
import { CatalogStatus } from '@prisma/client';
import { CatalogService } from '../../catalog/catalog.service';
import {
  AdminCreateCategoryDto,
  AdminCreateServiceDto,
  AdminUpdateCategoryDto,
  AdminUpdateServiceDto,
} from '../dto/catalog-admin.dto';
import { AdminAuditEvent } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminCatalogService {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly auditService: AdminAuditService,
  ) {}

  async listCategories(orgId: string, query: { page?: number; limit?: number; status?: any; search?: string }) {
    return this.catalogService.getCategories(query as any, orgId, true);
  }

  async getCategory(orgId: string, categoryId: string) {
    return this.catalogService.getCategoryById(categoryId, orgId, true);
  }

  async createCategory(
    orgId: string,
    dto: AdminCreateCategoryDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const category = await this.catalogService.createCategory(dto as any, orgId, actorUserId);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.CATEGORY_CREATED,
      entityType: 'ServiceCategory',
      entityId: category.id,
      metadata: { name: dto.name, slug: dto.slug },
      ipHash: ipAddress,
    });

    return category;
  }

  async updateCategory(
    orgId: string,
    categoryId: string,
    dto: AdminUpdateCategoryDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const category = await this.catalogService.updateCategory(categoryId, dto as any, orgId, actorUserId);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.CATEGORY_UPDATED,
      entityType: 'ServiceCategory',
      entityId: categoryId,
      metadata: { changes: dto },
      ipHash: ipAddress,
    });

    return category;
  }

  async deleteCategory(
    orgId: string,
    categoryId: string,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const result = await this.catalogService.deleteCategory(categoryId, orgId, actorUserId);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.CATEGORY_DELETED,
      entityType: 'ServiceCategory',
      entityId: categoryId,
      metadata: {},
      ipHash: ipAddress,
    });

    return result;
  }

  async listServices(orgId: string, query: { page?: number; limit?: number; categoryId?: string; status?: any; search?: string }) {
    return this.catalogService.getServices(query as any, orgId, true);
  }

  async getService(orgId: string, serviceId: string) {
    return this.catalogService.getServiceById(serviceId, orgId, true);
  }

  async createService(
    orgId: string,
    dto: AdminCreateServiceDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const service = await this.catalogService.createService(dto as any, orgId, actorUserId);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SERVICE_CREATED,
      entityType: 'Service',
      entityId: service.id,
      metadata: { name: dto.name, categoryId: dto.categoryId },
      ipHash: ipAddress,
    });

    return service;
  }

  async updateService(
    orgId: string,
    serviceId: string,
    dto: AdminUpdateServiceDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const service = await this.catalogService.updateService(serviceId, dto as any, orgId, actorUserId);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SERVICE_UPDATED,
      entityType: 'Service',
      entityId: serviceId,
      metadata: { changes: dto },
      ipHash: ipAddress,
    });

    return service;
  }

  async publishService(
    orgId: string,
    serviceId: string,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const service = await this.catalogService.updateServiceStatus(serviceId, {
      status: CatalogStatus.ACTIVE,
    }, orgId, actorUserId);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SERVICE_PUBLISHED,
      entityType: 'Service',
      entityId: serviceId,
      metadata: { status: CatalogStatus.ACTIVE },
      ipHash: ipAddress,
    });

    return service;
  }

  async unpublishService(
    orgId: string,
    serviceId: string,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const service = await this.catalogService.updateServiceStatus(serviceId, {
      status: CatalogStatus.INACTIVE,
    }, orgId, actorUserId);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.SERVICE_UNPUBLISHED,
      entityType: 'Service',
      entityId: serviceId,
      metadata: { status: CatalogStatus.INACTIVE },
      ipHash: ipAddress,
    });

    return service;
  }
}
