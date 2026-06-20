"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  BroadcastPushTestNotificationResultDto,
  PushSubscriptionDto,
} from "@/modules/notifications/application/PushNotificationDtos";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

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
): Promise<PushNotificationActionResult<{ subscription: PushSubscriptionDto }>> {
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
    const result = await getContainer().adminPushNotifications.sendTest(command);

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
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid push notification input.",
      ok: false,
    };
  }

  return {
    message: "Unexpected error while saving push notifications.",
    ok: false,
  };
}
