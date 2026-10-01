import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminRepository } from '../admin.repository';
import {
  AdminCancelAssignmentDto,
  AdminReassignDto,
  AssignmentAdminQueryDto,
} from '../dto/assignment-admin.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminAssignmentService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async listAssignments(orgId: string, query: AssignmentAdminQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findAssignments(orgId, {
      bookingId: query.bookingId,
      providerId: query.providerId,
      deliveryPartnerId: query.deliveryPartnerId,
      status: query.status,
      type: query.type,
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

  async getAssignment(orgId: string, assignmentId: string) {
    const assignment = await this.adminRepo.findAssignmentById(assignmentId, orgId);
    if (!assignment) {
      throw new NotFoundException({
        code: AdminErrorCode.ASSIGNMENT_NOT_FOUND,
        message: `Assignment ${assignmentId} not found`,
      });
    }
    return assignment;
  }

  async reassign(
    orgId: string,
    assignmentId: string,
    dto: AdminReassignDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const assignment = await this.getAssignment(orgId, assignmentId);

    if (assignment.status === 'COMPLETED' || assignment.status === 'CANCELLED') {
      throw new BadRequestException({
        code: AdminErrorCode.ASSIGNMENT_INVALID_STATE,
        message: `Cannot reassign an assignment with status ${assignment.status}`,
      });
    }

    if (!dto.providerId && !dto.deliveryPartnerId) {
      throw new BadRequestException({
        code: AdminErrorCode.VALIDATION_ERROR,
        message: 'Must provide either providerId or deliveryPartnerId to reassign',
      });
    }

    const updated = await this.adminRepo.reassignAssignment(assignment.id, orgId, {
      providerId: dto.providerId,
      deliveryPartnerId: dto.deliveryPartnerId,
      reason: dto.reason,
      actorUserId,
    });

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.ASSIGNMENT_REASSIGNED,
      entityType: 'BookingAssignment',
      entityId: assignment.id,
      metadata: {
        previousProviderId: assignment.providerId,
        previousPartnerId: assignment.deliveryPartnerId,
        newProviderId: dto.providerId,
        newPartnerId: dto.deliveryPartnerId,
        reason: dto.reason,
      },
      ipHash: ipAddress,
    });

    return updated;
  }

  async cancelAssignment(
    orgId: string,
    assignmentId: string,
    dto: AdminCancelAssignmentDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const assignment = await this.getAssignment(orgId, assignmentId);

    if (assignment.status === 'COMPLETED' || assignment.status === 'CANCELLED') {
      throw new BadRequestException({
        code: AdminErrorCode.ASSIGNMENT_INVALID_STATE,
        message: `Cannot cancel an assignment with status ${assignment.status}`,
      });
    }

    const updated = await this.adminRepo.cancelAssignment(assignment.id, orgId, {
      reason: dto.reason,
      actorUserId,
    });

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.ASSIGNMENT_CANCELLED,
      entityType: 'BookingAssignment',
      entityId: assignment.id,
      metadata: { reason: dto.reason, previousStatus: assignment.status },
      ipHash: ipAddress,
    });

    return updated;
  }
}
