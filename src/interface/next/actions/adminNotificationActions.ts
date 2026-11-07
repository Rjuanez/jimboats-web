"use server";

import { presentAdminError } from "../presenters/adminErrorPresenter";

import { getContainer } from "@/container";
import type {
  AdminNotificationActionResult,
  AdminNotificationPreview,
  AdminNotificationPreviewInput,
  AdminNotificationRuleInput,
  AdminNotificationsState,
  AdminNotificationSendDeliveryInput,
  AdminNotificationTemplateInput,
} from "@/components/sections/admin-notifications/AdminNotificationTypes";

import { presentAdminNotificationsWorkspace } from "../presenters/adminNotificationsPresenter";
import {
  parseAdminNotificationPreview,
  parseAdminNotificationRule,
  parseAdminNotificationSendDelivery,
  parseAdminNotificationTemplate,
} from "../validators/adminNotificationValidators";

const currentAdminUserId = "admin-user";

export async function saveAdminNotificationRuleAction(
  input: AdminNotificationRuleInput,
): Promise<AdminNotificationActionResult<{ state: AdminNotificationsState }>> {
  try {
    const commandInput = parseAdminNotificationRule(input);
    const container = getContainer();

    await container.adminNotifications.updateRule({
      ...commandInput,
      recipientType: "BUYER",
      updatedByUserId: currentAdminUserId,
    });

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function saveAdminNotificationTemplateAction(
  input: AdminNotificationTemplateInput,
): Promise<AdminNotificationActionResult<{ state: AdminNotificationsState }>> {
  try {
    const commandInput = parseAdminNotificationTemplate(input);
    const container = getContainer();

    await container.adminNotifications.updateTemplate({
      allowedVariables: commandInput.allowedVariables,
      channel: commandInput.channel,
      eventType: commandInput.eventType,
      notificationType: commandInput.notificationType,
      providerTemplateId: commandInput.providerTemplateId,
      requiredVariables: commandInput.requiredVariables,
      status: commandInput.status,
      templateId: commandInput.templateId,
      translations: commandInput.translations,
      updatedByUserId: currentAdminUserId,
    });

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function previewAdminNotificationTemplateAction(
  input: AdminNotificationPreviewInput,
): Promise<AdminNotificationActionResult<AdminNotificationPreview>> {
  try {
    const commandInput = parseAdminNotificationPreview(input);
    const container = getContainer();
    const preview = await container.adminNotifications.previewTemplate({
      bookingId: commandInput.bookingId,
      draftBody: commandInput.draftBody,
      draftHtmlBody: commandInput.draftHtmlBody,
      draftPreviewText: commandInput.draftPreviewText,
      draftSubject: commandInput.draftSubject,
      fixtureKey: commandInput.fixtureKey,
      locale: commandInput.locale,
      templateId: commandInput.templateId,
    });

    return ok(preview);
  } catch (error) {
    return failure(error);
  }
}

export async function sendAdminNotificationDeliveryAction(
  input: AdminNotificationSendDeliveryInput,
): Promise<AdminNotificationActionResult<{ state: AdminNotificationsState }>> {
  try {
    const commandInput = parseAdminNotificationSendDelivery(input);
    const container = getContainer();

    await container.adminNotifications.sendBookingNotification({
      notificationDeliveryId: commandInput.notificationDeliveryId,
      sentByUserId: currentAdminUserId,
    });

    return ok({
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

async function loadState(container: ReturnType<typeof getContainer>) {
  return presentAdminNotificationsWorkspace(
    await container.adminNotifications.getWorkspace(),
  );
}

function ok<TData>(data: TData): AdminNotificationActionResult<TData> {
  return {
    data,
    ok: true,
  };
}

function failure<TData = never>(
  error: unknown,
): AdminNotificationActionResult<TData> {
  return {
    message: presentAdminError(error),
    ok: false,
  };
}
