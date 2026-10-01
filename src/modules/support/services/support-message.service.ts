import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleType, SupportStatus } from '@prisma/client';
import {
  CreateSupportMessageDto,
  CreateSupportNoteDto,
  SupportMessageResponseDto,
  SupportNoteResponseDto,
} from '../dto';
import { SupportRepository } from '../repositories/support.repository';
import { SupportErrorCode } from '../types/support.types';

@Injectable()
export class SupportMessageService {
  constructor(private readonly supportRepo: SupportRepository) {}

  mapMessageToDto(msg: any): SupportMessageResponseDto {
    return {
      id: msg.id,
      publicId: msg.publicId,
      ticketId: msg.ticketId,
      senderUserId: msg.senderUserId,
      senderName: msg.senderUser?.email ?? null,
      message: msg.message,
      isInternal: msg.isInternal,
      createdAt: msg.createdAt,
    };
  }

  mapNoteToDto(note: any): SupportNoteResponseDto {
    return {
      id: note.id,
      publicId: note.publicId ?? null,
      ticketId: note.ticketId,
      authorUserId: note.authorUserId,
      authorName: note.authorUser?.email ?? null,
      note: note.message,
      isInternalOnly: note.isInternalOnly,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  // ============================================================================
  // 1. MESSAGES
  // ============================================================================

  async addMessage(
    organizationId: string,
    ticketIdentifier: string,
    dto: CreateSupportMessageDto,
    senderUserId: string,
    userRoles: RoleType[],
  ): Promise<SupportMessageResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    const isOperations =
      userRoles.includes(RoleType.ADMIN) ||
      userRoles.includes(RoleType.OPERATIONS) ||
      userRoles.includes(RoleType.SUPPORT_LEAD) ||
      userRoles.includes(RoleType.SUPPORT_AGENT);

    if (!isOperations) {
      if (dto.isInternal) {
        throw new ForbiddenException({
          code: SupportErrorCode.SUPPORT_INTERNAL_MESSAGE_ACCESS_DENIED,
          message: 'Participants cannot post internal operations messages.',
        });
      }

      const user = await this.supportRepo.findUserById(senderUserId);
      const customer = user?.customers.find((c) => c.organizationId === organizationId);
      const provider = user?.providers.find((p) => p.organizationId === organizationId);
      const delivery = user?.deliveryPartners.find((d) => d.organizationId === organizationId);

      const isOwner =
        ticket.createdByUserId === senderUserId ||
        (customer && ticket.customerId === customer.id) ||
        (provider && ticket.providerId === provider.id) ||
        (delivery && ticket.deliveryPartnerId === delivery.id);

      if (!isOwner) {
        throw new ForbiddenException({
          code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
          message: 'You can only message support tickets associated with your account.',
        });
      }
    }

    const message = dto.message.trim();
    if (!message) {
      throw new BadRequestException({
        code: SupportErrorCode.VALIDATION_ERROR,
        message: 'Support message cannot be empty or whitespace only.',
      });
    }

    const created = await this.supportRepo.createSupportMessage({
      organizationId,
      ticketId: ticket.id,
      senderUserId,
      message,
      isInternal: isOperations ? !!dto.isInternal : false,
    });

    // If requester replied while waiting, transition back to IN_PROGRESS
    if (
      !isOperations &&
      (ticket.status === SupportStatus.WAITING_FOR_CUSTOMER ||
        ticket.status === SupportStatus.WAITING_FOR_PROVIDER ||
        ticket.status === SupportStatus.WAITING_FOR_DELIVERY_PARTNER ||
        ticket.status === SupportStatus.WAITING_ON_CUSTOMER ||
        ticket.status === SupportStatus.WAITING_ON_PROVIDER)
    ) {
      await this.supportRepo.updateTicketStatus(
        organizationId,
        ticket.id,
        SupportStatus.IN_PROGRESS,
        ticket.status,
        senderUserId,
        { reason: 'Requester added reply message' },
      );
    }

    return this.mapMessageToDto(created);
  }

  async listMessages(
    organizationId: string,
    ticketIdentifier: string,
    userId: string,
    userRoles: RoleType[],
  ): Promise<SupportMessageResponseDto[]> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
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

      const isOwner =
        ticket.createdByUserId === userId ||
        (customer && ticket.customerId === customer.id) ||
        (provider && ticket.providerId === provider.id) ||
        (delivery && ticket.deliveryPartnerId === delivery.id);

      if (!isOwner) {
        throw new ForbiddenException({
          code: SupportErrorCode.SUPPORT_TICKET_ACCESS_DENIED,
          message: 'You do not have permission to view messages for this ticket.',
        });
      }
    }

    const messages = await this.supportRepo.listSupportMessages(
      organizationId,
      ticket.id,
      isOperations,
    );

    return messages.map((m) => this.mapMessageToDto(m));
  }

  // ============================================================================
  // 2. INTERNAL NOTES (OPERATIONS ONLY)
  // ============================================================================

  async addNote(
    organizationId: string,
    ticketIdentifier: string,
    dto: CreateSupportNoteDto,
    authorUserId: string,
  ): Promise<SupportNoteResponseDto> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    const noteText = dto.note.trim();
    if (!noteText) {
      throw new BadRequestException({
        code: SupportErrorCode.VALIDATION_ERROR,
        message: 'Support note cannot be empty or whitespace only.',
      });
    }

    const note = await this.supportRepo.createSupportNote({
      organizationId,
      ticketId: ticket.id,
      authorUserId,
      message: noteText,
    });

    return this.mapNoteToDto(note);
  }

  async listNotes(
    organizationId: string,
    ticketIdentifier: string,
  ): Promise<SupportNoteResponseDto[]> {
    const ticket = await this.supportRepo.findTicketByIdentifier(
      organizationId,
      ticketIdentifier,
    );
    if (!ticket) {
      throw new NotFoundException({
        code: SupportErrorCode.SUPPORT_TICKET_NOT_FOUND,
        message: `Support ticket '${ticketIdentifier}' was not found.`,
      });
    }

    const notes = await this.supportRepo.listSupportNotes(
      organizationId,
      ticket.id,
    );

    return notes.map((n) => this.mapNoteToDto(n));
  }
}
