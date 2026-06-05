import { LocaleCode } from "@/shared/domain/LocaleCode";

import { notificationTemplateToDto } from "./NotificationApplicationMappers";
import type {
  NotificationTemplateDto,
  UpdateNotificationTemplateCommand,
} from "./NotificationDtos";
import type { NotificationAuditRepository } from "./ports/NotificationAuditRepository";
import type { NotificationClock } from "./ports/NotificationClock";
import type { NotificationTemplateRepository } from "./ports/NotificationTemplateRepository";
import { NotificationChannel } from "../domain/NotificationChannel";
import { NotificationTemplate } from "../domain/NotificationTemplate";
import { NotificationType } from "../domain/NotificationType";

export class UpdateNotificationTemplateUseCase {
  constructor(
    private readonly templates: NotificationTemplateRepository,
    private readonly audit: NotificationAuditRepository,
    private readonly clock: NotificationClock,
  ) {}

  async execute(
    command: UpdateNotificationTemplateCommand,
  ): Promise<NotificationTemplateDto> {
    const now = this.clock.now();
    const existingTemplate = await this.templates.findById(command.templateId);
    const existingSnapshot = existingTemplate?.toSnapshot();
    const template = NotificationTemplate.create({
      allowedVariables: command.allowedVariables,
      channel: NotificationChannel.create(command.channel),
      eventType: command.eventType,
      id: command.templateId,
      notificationType: NotificationType.create(command.notificationType),
      providerTemplateId: command.providerTemplateId,
      requiredVariables: command.requiredVariables,
      status: command.status,
      translations: command.translations.map((translation) => ({
        body: translation.body,
        locale: LocaleCode.create(translation.locale),
        previewText: translation.previewText,
        status: translation.status,
        subject: translation.subject,
        updatedAt: now,
        updatedByUserId: command.updatedByUserId,
      })),
      updatedAt: now,
      updatedByUserId: command.updatedByUserId,
      version: existingSnapshot ? existingSnapshot.version + 1 : 1,
    });

    await this.templates.save(template);
    await this.audit.record({
      action: "NOTIFICATION_TEMPLATE_UPDATED",
      actorUserId: command.updatedByUserId,
      createdAt: now,
      diff: {
        after: template.toSnapshot(),
        before: existingSnapshot ?? null,
      },
      resourceId: template.id,
      resourceType: "NOTIFICATION_TEMPLATE",
    });

    return notificationTemplateToDto(template);
  }
}
