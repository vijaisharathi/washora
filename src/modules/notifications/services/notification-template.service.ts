import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { TemplateResolverService } from './template-resolver.service';
import {
  NotificationAuditAction,
  NotificationErrorCode,
} from '../types/notifications.types';
import {
  CreateNotificationTemplateDto,
  NotificationTemplateListQueryDto,
  UpdateNotificationTemplateDto,
} from '../dto';

@Injectable()
export class NotificationTemplateService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly templateResolver: TemplateResolverService,
  ) {}

  async getTemplates(
    organizationId: string,
    query: NotificationTemplateListQueryDto,
  ) {
    return this.repository.findTemplates(organizationId, query);
  }

  async getTemplateById(
    organizationId: string,
    templateIdentifier: string,
  ) {
    const template = await this.repository.findTemplateById(
      organizationId,
      templateIdentifier,
    );

    if (!template) {
      throw new NotFoundException({
        code: NotificationErrorCode.TEMPLATE_NOT_FOUND,
        message: `Notification template ${templateIdentifier} was not found`,
      });
    }

    if (template.organizationId !== organizationId) {
      throw new ForbiddenException({
        code: NotificationErrorCode.TENANT_MISMATCH,
        message: 'Template belongs to a different organization',
      });
    }

    return template;
  }

  async createTemplate(
    organizationId: string,
    dto: CreateNotificationTemplateDto,
    actorUserId: string,
  ) {
    // 1. Validate variables in subject, title, and body
    if (dto.subject) {
      this.templateResolver.validateTemplate(dto.subject, 'subject');
    }
    this.templateResolver.validateTemplate(dto.titleTemplate, 'titleTemplate');
    this.templateResolver.validateTemplate(dto.bodyTemplate, 'bodyTemplate');

    // 2. Compute next sequential version for this (organizationId, type, channel)
    const latestVersion = await this.repository.findLatestTemplateVersion(
      organizationId,
      dto.type,
      dto.channel,
    );
    const version = latestVersion + 1;

    // 3. Create template record
    const template = await this.repository.createTemplate({
      organizationId,
      type: dto.type,
      channel: dto.channel,
      subject: dto.subject,
      titleTemplate: dto.titleTemplate,
      bodyTemplate: dto.bodyTemplate,
      version,
      status: 'ACTIVE',
    });

    // 4. Record audit event
    await this.repository.recordAuditEvent(
      organizationId,
      actorUserId,
      NotificationAuditAction.NOTIFICATION_TEMPLATE_CREATED,
      'NotificationTemplate',
      template.id,
      {
        publicId: template.publicId,
        type: template.type,
        channel: template.channel,
        version: template.version,
      },
    );

    return template;
  }

  async updateTemplate(
    organizationId: string,
    templateIdentifier: string,
    dto: UpdateNotificationTemplateDto,
    actorUserId: string,
  ) {
    const template = await this.getTemplateById(organizationId, templateIdentifier);

    // Validate variables if updated
    if (dto.subject) {
      this.templateResolver.validateTemplate(dto.subject, 'subject');
    }
    if (dto.titleTemplate) {
      this.templateResolver.validateTemplate(dto.titleTemplate, 'titleTemplate');
    }
    if (dto.bodyTemplate) {
      this.templateResolver.validateTemplate(dto.bodyTemplate, 'bodyTemplate');
    }

    const updated = await this.repository.updateTemplate(
      organizationId,
      template.id,
      dto,
    );

    const isArchived = dto.status === 'ARCHIVED';
    const auditAction = isArchived
      ? NotificationAuditAction.NOTIFICATION_TEMPLATE_ARCHIVED
      : NotificationAuditAction.NOTIFICATION_TEMPLATE_UPDATED;

    await this.repository.recordAuditEvent(
      organizationId,
      actorUserId,
      auditAction,
      'NotificationTemplate',
      updated.id,
      {
        publicId: updated.publicId,
        version: updated.version,
        status: updated.status,
      },
    );

    return updated;
  }
}
