"use server";

import { presentAdminError } from "../presenters/adminErrorPresenter";

import { getContainer } from "@/container";
import type {
  BroadcastPushTestNotificationResultDto,
  PushSubscriptionDto,
} from "@/modules/notifications/application/PushNotificationDtos";

import {
  parsePushSubscriptionInput,
  parsePushTestInput,
  type PushSubscriptionInput,
  type PushTestInput,
} from "../validators/pushNotificationValidators";

export type PushNotificationActionResult<TData> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export async function registerPushSubscriptionAction(
  input: PushSubscriptionInput,
): Promise<
  PushNotificationActionResult<{ subscription: PushSubscriptionDto }>
> {
  try {
    const command = parsePushSubscriptionInput(input);
    const subscription =
      await getContainer().adminPushNotifications.registerSubscription(command);

    return {
      data: {
        subscription,
      },
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function sendPushTestNotificationAction(
  input: PushTestInput,
): Promise<PushNotificationActionResult<{ status: "FAILED" | "SENT" }>> {
  try {
    const command = parsePushTestInput(input);
    const result =
      await getContainer().adminPushNotifications.sendTest(command);

    return {
      data: result,
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function sendBroadcastPushTestNotificationAction(): Promise<
  PushNotificationActionResult<BroadcastPushTestNotificationResultDto>
> {
  try {
    const result =
      await getContainer().adminPushNotifications.sendBroadcastTest();

    return {
      data: result,
      ok: true,
    };
  } catch (error) {
    return failure(error);
  }
}

function failure<TData = never>(
  error: unknown,
): PushNotificationActionResult<TData> {
  return {
    message: presentAdminError(error),
    ok: false,
  };
}
