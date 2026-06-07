import { applicationError } from "@/shared/application/ApplicationError";

import type {
  PreviewNotificationTemplateCommand,
  PreviewNotificationTemplateResultDto,
} from "./NotificationDtos";
import { addNotificationTemplatePayloadAliases } from "./NotificationTemplatePayloadAliases";
import type { NotificationBookingReader } from "./ports/NotificationBookingReader";
import type { NotificationPreviewFixtureProvider } from "./ports/NotificationPreviewFixtureProvider";
import type { NotificationTemplateRepository } from "./ports/NotificationTemplateRepository";
import type { TemplateRenderer } from "./ports/TemplateRenderer";

export class PreviewNotificationTemplateUseCase {
  constructor(
    private readonly templates: NotificationTemplateRepository,
    private readonly bookings: NotificationBookingReader,
    private readonly fixtures: NotificationPreviewFixtureProvider,
    private readonly renderer: TemplateRenderer,
  ) {}

  async execute(
    command: PreviewNotificationTemplateCommand,
  ): Promise<PreviewNotificationTemplateResultDto> {
    const template = await this.templates.findById(command.templateId);

    if (!template) {
      throw applicationError(
        "NOTIFICATION_TEMPLATE_NOT_FOUND",
        "Notification template was not found.",
      );
    }

    const templateSnapshot = template.toSnapshot();
    const translation = templateSnapshot.translations.find(
      (item) => item.locale === command.locale,
    );
    const body = command.draftBody ?? translation?.body;
    const htmlBody =
      command.draftHtmlBody !== undefined
        ? command.draftHtmlBody
        : translation?.htmlBody ?? null;

    if (!body) {
      throw applicationError(
        "NOTIFICATION_TEMPLATE_TRANSLATION_MISSING",
        "Notification template translation was not found.",
      );
    }

    const payload = await this.resolvePayload(command);
    const rendered = await this.renderer.render({
      allowedVariables: templateSnapshot.allowedVariables,
      body,
      htmlBody,
      payload,
      previewText:
        command.draftPreviewText !== undefined
          ? command.draftPreviewText
          : translation?.previewText ?? null,
      subject:
        command.draftSubject !== undefined
          ? command.draftSubject
          : translation?.subject ?? null,
    });

    return {
      ...rendered,
      warnings:
        rendered.missingVariables.length > 0
          ? ["Some variables are missing from the preview payload."]
          : [],
    };
  }

  private async resolvePayload(command: PreviewNotificationTemplateCommand) {
    if (command.bookingId) {
      const booking = await this.bookings.findNotificationBookingById(
        command.bookingId,
      );

      if (!booking) {
        throw applicationError("BOOKING_NOT_FOUND", "Booking was not found.");
      }

      return addNotificationTemplatePayloadAliases(booking.templatePayload);
    }

    if (command.fixtureKey) {
      const fixture = await this.fixtures.findByKey(command.fixtureKey);

      if (!fixture) {
        throw applicationError(
          "NOTIFICATION_PREVIEW_FIXTURE_MISSING",
          "Notification preview fixture was not found.",
        );
      }

      return addNotificationTemplatePayloadAliases(fixture);
    }

    throw applicationError(
      "NOTIFICATION_PREVIEW_SOURCE_MISSING",
      "Notification preview requires a booking or fixture.",
    );
  }
}
