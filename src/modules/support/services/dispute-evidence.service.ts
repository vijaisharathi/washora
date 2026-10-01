import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import {
  CreateDisputeEvidenceDto,
  DisputeEvidenceResponseDto,
  RejectEvidenceDto,
} from '../dto';
import { SupportRepository } from '../repositories/support.repository';
import { SupportErrorCode } from '../types/support.types';
import { EvidenceStorageService } from './evidence-storage.service';

@Injectable()
export class DisputeEvidenceService {
  constructor(
    private readonly supportRepo: SupportRepository,
    private readonly storageService: EvidenceStorageService,
  ) {}

  mapToResponseDto(evidence: any): DisputeEvidenceResponseDto {
    return {
      id: evidence.id,
      publicId: evidence.publicId ?? null,
      disputeId: evidence.disputeId,
      submittedByUserId: evidence.submittedByUserId,
      submittedByName: evidence.submittedByUser?.email ?? null,
      title: evidence.title,
      description: evidence.description,
      fileType: evidence.fileType,
      fileName: evidence.fileName,
      mimeType: evidence.mimeType,
      fileSize: evidence.fileSize,
      fileUrl: evidence.fileUrl,
      status: evidence.status,
      rejectionReason: evidence.rejectionReason,
      createdAt: evidence.createdAt,
      updatedAt: evidence.updatedAt,
    };
  }

  async submitEvidence(
    organizationId: string,
    disputeIdentifier: string,
    dto: CreateDisputeEvidenceDto,
    userId: string,
    userRoles: RoleType[],
  ): Promise<DisputeEvidenceResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const isOperations =
      userRoles.includes(RoleType.ADMIN) ||
      userRoles.includes(RoleType.OPERATIONS) ||
      userRoles.includes(RoleType.SUPPORT_LEAD) ||
      userRoles.includes(RoleType.SUPPORT_AGENT);

    let uploadedByType = 'OPERATIONS';

    if (!isOperations) {
      const user = await this.supportRepo.findUserById(userId);
      const customer = user?.customers.find((c) => c.organizationId === organizationId);
      const provider = user?.providers.find((p) => p.organizationId === organizationId);
      const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);

      const isParticipant =
        dispute.createdByUserId === userId ||
        (customer && dispute.customerId === customer.id) ||
        (provider && dispute.providerId === provider.id) ||
        (delivery && dispute.deliveryPartnerId === delivery.id);

      if (!isParticipant) {
        throw new ForbiddenException({
          code: SupportErrorCode.DISPUTE_EVIDENCE_ACCESS_DENIED,
          message: 'You can only submit evidence to disputes you participate in.',
        });
      }

      if (customer && dispute.customerId === customer.id) uploadedByType = 'CUSTOMER';
      else if (provider && dispute.providerId === provider.id) uploadedByType = 'PROVIDER';
      else if (delivery && dispute.deliveryPartnerId === delivery.id) uploadedByType = 'DELIVERY_PARTNER';
      else uploadedByType = 'USER';
    }

    // Storage abstraction & MIME validation
    const stored = this.storageService.storeEvidence(organizationId, dispute.id, {
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
    });

    const evidence = await this.supportRepo.createEvidence({
      organizationId,
      disputeId: dispute.id,
      submittedByUserId: userId,
      title: dto.title,
      description: dto.description,
      fileType: dto.fileType,
      fileName: stored.fileName,
      mimeType: stored.mimeType,
      fileSize: stored.fileSize,
      fileUrl: stored.fileUrl,
      storageKey: stored.storageKey,
      uploadedByType,
    });

    return this.mapToResponseDto(evidence);
  }

  async listEvidence(
    organizationId: string,
    disputeIdentifier: string,
    userId: string,
    userRoles: RoleType[],
  ): Promise<DisputeEvidenceResponseDto[]> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const isOperations =
      userRoles.includes(RoleType.ADMIN) ||
      userRoles.includes(RoleType.OPERATIONS) ||
      userRoles.includes(RoleType.SUPPORT_LEAD) ||
      userRoles.includes(RoleType.SUPPORT_AGENT);

    if (!isOperations) {
      const user = await this.supportRepo.findUserById(userId);
      const customer = user?.customers.find((c) => c.organizationId === organizationId);
      const provider = user?.providers.find((p) => p.organizationId === organizationId);
      const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);

      const isParticipant =
        dispute.createdByUserId === userId ||
        (customer && dispute.customerId === customer.id) ||
        (provider && dispute.providerId === provider.id) ||
        (delivery && dispute.deliveryPartnerId === delivery.id);

      if (!isParticipant) {
        throw new ForbiddenException({
          code: SupportErrorCode.DISPUTE_EVIDENCE_ACCESS_DENIED,
          message: 'You do not have permission to view evidence for this dispute.',
        });
      }
    }

    const evidenceList = await this.supportRepo.listEvidence(
      organizationId,
      dispute.id,
    );

    return evidenceList.map((e) => this.mapToResponseDto(e));
  }

  async acceptEvidence(
    organizationId: string,
    disputeIdentifier: string,
    evidenceIdentifier: string,
    operatorUserId: string,
  ): Promise<DisputeEvidenceResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const evidence = await this.supportRepo.findEvidenceById(
      organizationId,
      evidenceIdentifier,
    );
    if (!evidence || evidence.disputeId !== dispute.id) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_EVIDENCE_NOT_FOUND,
        message: `Evidence '${evidenceIdentifier}' was not found for this dispute.`,
      });
    }

    const updated = await this.supportRepo.reviewEvidence(
      organizationId,
      evidence.id,
      'ACCEPTED',
      null,
      operatorUserId,
    );

    return this.mapToResponseDto(updated);
  }

  async rejectEvidence(
    organizationId: string,
    disputeIdentifier: string,
    evidenceIdentifier: string,
    dto: RejectEvidenceDto,
    operatorUserId: string,
  ): Promise<DisputeEvidenceResponseDto> {
    const dispute = await this.supportRepo.findDisputeByIdentifier(
      organizationId,
      disputeIdentifier,
    );
    if (!dispute) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_NOT_FOUND,
        message: `Dispute '${disputeIdentifier}' was not found.`,
      });
    }

    const evidence = await this.supportRepo.findEvidenceById(
      organizationId,
      evidenceIdentifier,
    );
    if (!evidence || evidence.disputeId !== dispute.id) {
      throw new NotFoundException({
        code: SupportErrorCode.DISPUTE_EVIDENCE_NOT_FOUND,
        message: `Evidence '${evidenceIdentifier}' was not found for this dispute.`,
      });
    }

    const rejectionReason = dto.rejectionReason.trim();
    if (!rejectionReason) {
      throw new BadRequestException({
        code: SupportErrorCode.DISPUTE_EVIDENCE_REVIEW_REQUIRED,
        message: 'A valid rejection reason must be provided.',
      });
    }

    const updated = await this.supportRepo.reviewEvidence(
      organizationId,
      evidence.id,
      'REJECTED',
      rejectionReason,
      operatorUserId,
    );

    return this.mapToResponseDto(updated);
  }
}
