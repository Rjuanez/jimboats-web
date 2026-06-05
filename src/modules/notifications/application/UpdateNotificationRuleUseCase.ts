import { applicationError } from "@/shared/application/ApplicationError";

import {
  launchNotificationLocales,
  notificationRuleToDto,
} from "./NotificationApplicationMappers";
import type {
  NotificationRuleDto,
  UpdateNotificationRuleCommand,
} from "./NotificationDtos";
import type { NotificationAuditRepository } from "./ports/NotificationAuditRepository";
import type { NotificationClock } from "./ports/NotificationClock";
import type { NotificationIdGenerator } from "./ports/NotificationIdGenerator";
import type { NotificationRuleRepository } from "./ports/NotificationRuleRepository";
import type { NotificationTemplateRepository } from "./ports/NotificationTemplateRepository";
import { NotificationChannel } from "../domain/NotificationChannel";
import { NotificationRule } from "../domain/NotificationRule";
import { NotificationType } from "../domain/NotificationType";

export class UpdateNotificationRuleUseCase {
  constructor(
    private readonly rules: NotificationRuleRepository,
    private readonly templates: NotificationTemplateRepository,
    private readonly audit: NotificationAuditRepository,
    private readonly ids: NotificationIdGenerator,
    private readonly clock: NotificationClock,
  ) {}

  async execute(
    command: UpdateNotificationRuleCommand,
  ): Promise<NotificationRuleDto> {
    const now = this.clock.now();
    const existingRule = command.ruleId
      ? await this.rules.findById(command.ruleId)
      : null;

    if (command.ruleId && !existingRule) {
      throw applicationError(
        "NOTIFICATION_RULE_NOT_FOUND",
        "Notification rule was not found.",
      );
    }

    const duplicateRule = await this.rules.findActiveByIdentity({
      channel: command.channel,
      eventType: command.eventType,
      recipientType: command.recipientType,
    });

    if (
      duplicateRule &&
      duplicateRule.id !== command.ruleId &&
      command.status !== "ARCHIVED"
    ) {
      throw applicationError(
        "NOTIFICATION_RULE_DUPLICATE",
        "An active notification rule already exists for this event and channel.",
      );
    }

    const readinessWarnings: string[] = [];
    const template = command.templateId
      ? await this.templates.findById(command.templateId)
      : null;

    if (command.enabled && !template) {
      throw applicationError(
        "NOTIFICATION_TEMPLATE_NOT_FOUND",
        "Enabled notification rule requires an existing template.",
      );
    }

    if (command.enabled && template?.status !== "ACTIVE") {
      throw applicationError(
        "NOTIFICATION_RULE_CANNOT_ENABLE",
        "Enabled notification rule requires an active template.",
      );
    }

    if (template) {
      const missingLocales =
        template.getMissingPublishedLocales(launchNotificationLocales);

      if (missingLocales.length > 0) {
        readinessWarnings.push(
          `Missing published translations: ${missingLocales.join(", ")}.`,
        );
      }
    }

    const existingSnapshot = existingRule?.toSnapshot();
    const rule = NotificationRule.create({
      channel: NotificationChannel.create(command.channel),
      createdAt: existingSnapshot
        ? new Date(existingSnapshot.createdAt)
        : now,
      enabled: command.enabled,
      eventType: command.eventType,
      id: existingSnapshot?.id ?? this.ids.newNotificationRuleId(),
      localeStrategy: "BOOKING_PREFERRED_LOCALE",
      missingTranslationBehavior: "DO_NOT_SEND",
      notificationType: NotificationType.create(command.notificationType),
      recipientType: command.recipientType,
      requiresConsent: command.requiresConsent,
      sendMode: command.sendMode,
      status: command.status ?? "ACTIVE",
      templateId: command.templateId,
      updatedAt: now,
      updatedByUserId: command.updatedByUserId,
    });

    await this.rules.save(rule);
    await this.audit.record({
      action: "NOTIFICATION_RULE_UPDATED",
      actorUserId: command.updatedByUserId,
      createdAt: now,
      diff: {
        after: rule.toSnapshot(),
        before: existingSnapshot ?? null,
      },
      resourceId: rule.id,
      resourceType: "NOTIFICATION_RULE",
    });

    return notificationRuleToDto(rule, readinessWarnings);
  }
}
