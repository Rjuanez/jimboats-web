import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type { NotificationDelivery } from "../domain/NotificationDelivery";
import type { NotificationRule } from "../domain/NotificationRule";
import type { NotificationTemplate } from "../domain/NotificationTemplate";
import type {
  NotificationDeliveryDto,
  NotificationRuleDto,
  NotificationTemplateDto,
} from "./NotificationDtos";

export const launchNotificationLocales: SupportedLocaleCode[] = [
  "en",
  "es",
  "ca",
];

export function notificationRuleToDto(
  rule: NotificationRule,
  readinessWarnings: string[] = [],
): NotificationRuleDto {
  return {
    ...rule.toSnapshot(),
    readinessWarnings,
  };
}

export function notificationTemplateToDto(
  template: NotificationTemplate,
): NotificationTemplateDto {
  return {
    ...template.toSnapshot(),
    missingPublishedLocales:
      template.status === "ARCHIVED"
        ? []
        : template.getMissingPublishedLocales(launchNotificationLocales),
  };
}

export function notificationDeliveryToDto(
  delivery: NotificationDelivery,
): NotificationDeliveryDto {
  return delivery.toSnapshot();
}
