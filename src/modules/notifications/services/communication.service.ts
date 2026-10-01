import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { MockCommunicationProvider } from './delivery-adapter.service';
import {
  CommunicationChannel,
  CommunicationStatus,
  NotificationAuditAction,
  NotificationErrorCode,
  RecipientType,
} from '../types/notifications.types';
import {
  CancelCommunicationDto,
  CommunicationListQueryDto,
  RetryCommunicationDto,
} from '../dto';

@Injectable()
export class CommunicationService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly provider: MockCommunicationProvider,
  ) {}

  async getCommunications(
    organizationId: string,
    query: CommunicationListQueryDto,
  ) {
    return this.repository.findCommunications(organizationId, query);
  }

  async getCommunicationById(
    organizationId: string,
    communicationIdentifier: string,
  ) {
    const comm = await this.repository.findCommunicationById(
      organizationId,
      communicationIdentifier,
    );

    if (!comm) {
      throw new NotFoundException({
        code: NotificationErrorCode.COMMUNICATION_NOT_FOUND,
        message: `Communication ${communicationIdentifier} was not found`,
      });
    }

    if (comm.organizationId !== organizationId) {
      throw new ForbiddenException({
        code: NotificationErrorCode.TENANT_MISMATCH,
        message: 'Communication belongs to a different organization',
      });
    }

    return comm;
  }

  /**
   * Dispatch a new communication through the provider adapter and record recipients
   */
  async dispatchCommunication(data: {
    organizationId: string;
    senderUserId: string;
    notificationId?: string | null;
    channel: CommunicationChannel;
    type?: string;
    subject: string;
    body: string;
    content?: string | null;
    recipients: Array<{
      recipientType: RecipientType;
      recipientId?: string | null;
      userId?: string | null;
      channelAddress?: string | null;
    }>;
  }) {
    // 1. Initial status QUEUED
    const comm = await this.repository.createCommunicationWithRecipients({
      organizationId: data.organizationId,
      senderUserId: data.senderUserId,
      notificationId: data.notificationId,
      channel: data.channel,
      type: data.type ?? 'TRANSACTIONAL',
      subject: data.subject,
      body: data.body,
      content: data.content,
      status: CommunicationStatus.PROCESSING,
      recipients: data.recipients.map((r) => ({
        ...r,
        status: CommunicationStatus.PROCESSING,
      })),
    });

    // 2. Dispatch via Mock Provider Adapter
    const targetAddress = data.recipients[0]?.channelAddress || 'user@example.com';
    const dispatchResult = await this.provider.send({
      channel: data.channel,
      recipientAddress: targetAddress,
      subject: data.subject,
      body: data.body,
      content: data.content,
    });

    const finalStatus = dispatchResult.success
      ? CommunicationStatus.SENT
      : CommunicationStatus.FAILED;

    await this.repository.updateCommunicationStatus(
      data.organizationId,
      comm.id,
      finalStatus,
      {
        provider: dispatchResult.provider,
        providerMessageId: dispatchResult.providerMessageId,
        failureReason: dispatchResult.error,
        sentAt: dispatchResult.success ? new Date() : undefined,
      },
    );

    await this.repository.recordAuditEvent(
      data.organizationId,
      data.senderUserId,
      dispatchResult.success
        ? NotificationAuditAction.COMMUNICATION_SENT
        : NotificationAuditAction.COMMUNICATION_FAILED,
      'Communication',
      comm.id,
      {
        publicId: comm.publicId,
        channel: comm.channel,
        status: finalStatus,
        provider: dispatchResult.provider,
        providerMessageId: dispatchResult.providerMessageId,
      },
    );

    return this.getCommunicationById(data.organizationId, comm.id);
  }

  /**
   * Retry failed communication. Max 3 attempts allowed.
   */
  async retryCommunication(
    organizationId: string,
    communicationIdentifier: string,
    dto: RetryCommunicationDto,
    actorUserId: string,
  ) {
    const comm = await this.getCommunicationById(organizationId, communicationIdentifier);

    if (comm.attemptCount >= 3) {
      throw new BadRequestException({
        code: NotificationErrorCode.COMMUNICATION_RETRY_EXCEEDED,
        message: `Maximum retry limit (3 attempts) exceeded for communication ${comm.publicId}`,
      });
    }

    // Dispatch via Provider
    const targetAddress = comm.recipients[0]?.channelAddress || 'user@example.com';
    const dispatchResult = await this.provider.send({
      channel: comm.channel,
      recipientAddress: targetAddress,
      subject: comm.subject,
      body: comm.body,
      content: comm.content,
    });

    const finalStatus = dispatchResult.success
      ? CommunicationStatus.SENT
      : CommunicationStatus.FAILED;

    const updated = await this.repository.incrementCommunicationAttempt(
      organizationId,
      comm.id,
      finalStatus,
      {
        providerMessageId: dispatchResult.providerMessageId,
        failureReason: dispatchResult.error,
      },
    );

    await this.repository.recordAuditEvent(
      organizationId,
      actorUserId,
      NotificationAuditAction.COMMUNICATION_RETRIED,
      'Communication',
      comm.id,
      {
        publicId: comm.publicId,
        attemptCount: updated.attemptCount,
        status: finalStatus,
        reason: dto.reason,
      },
    );

    return updated;
  }

  /**
   * Cancel queued or processing communication. Cannot cancel if already SENT or DELIVERED.
   */
  async cancelCommunication(
    organizationId: string,
    communicationIdentifier: string,
    dto: CancelCommunicationDto,
    actorUserId: string,
  ) {
    const comm = await this.getCommunicationById(organizationId, communicationIdentifier);

    if (
      comm.status === CommunicationStatus.SENT ||
      comm.status === CommunicationStatus.DELIVERED
    ) {
      throw new BadRequestException({
        code: NotificationErrorCode.COMMUNICATION_CANCEL_FORBIDDEN,
        message: `Cannot cancel communication ${comm.publicId} because it has already been ${comm.status}`,
      });
    }

    await this.repository.updateCommunicationStatus(
      organizationId,
      comm.id,
      CommunicationStatus.CANCELLED,
      {
        failureReason: `Cancelled by operator: ${dto.reason}`,
      },
    );

    await this.repository.recordAuditEvent(
      organizationId,
      actorUserId,
      NotificationAuditAction.COMMUNICATION_CANCELLED,
      'Communication',
      comm.id,
      {
        publicId: comm.publicId,
        reason: dto.reason,
      },
    );

    return {
      ...comm,
      status: CommunicationStatus.CANCELLED,
      failureReason: `Cancelled by operator: ${dto.reason}`,
    };
  }
}
