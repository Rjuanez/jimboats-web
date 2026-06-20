import { timingSafeEqual } from "crypto";

import { ApplicationError } from "@/shared/application/ApplicationError";

import { pushSubscriptionToDto } from "./PushNotificationApplicationMappers";
import type {
  PushSubscriptionDto,
  RegisterPushSubscriptionCommand,
} from "./PushNotificationDtos";
import type { PushSubscriptionRepository } from "./ports/PushSubscriptionRepository";

export class RegisterPushSubscriptionUseCase {
  constructor(
    private readonly subscriptions: PushSubscriptionRepository,
    private readonly expectedActivationCode: string | null,
  ) {}

  async execute(
    command: RegisterPushSubscriptionCommand,
  ): Promise<PushSubscriptionDto> {
    assertActivationCode(command.activationCode, this.expectedActivationCode);

    if (command.permission !== "GRANTED") {
      throw new ApplicationError(
        "PUSH_PERMISSION_NOT_GRANTED",
        "Notification permission must be granted before saving this device.",
      );
    }

    const subscription = await this.subscriptions.upsert({
      auth: command.auth,
      displayMode: command.displayMode,
      endpoint: command.endpoint,
      label: command.label,
      p256dh: command.p256dh,
      permission: command.permission,
      platform: command.platform,
      userAgent: command.userAgent,
    });

    return pushSubscriptionToDto(subscription);
  }
}

export function assertActivationCode(
  providedCode: string,
  expectedCode: string | null,
) {
  if (!expectedCode) {
    throw new ApplicationError(
      "PUSH_ACTIVATION_NOT_CONFIGURED",
      "Push activation is not configured.",
    );
  }

  const provided = Buffer.from(providedCode.trim());
  const expected = Buffer.from(expectedCode.trim());

  if (
    provided.length === 0 ||
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    throw new ApplicationError(
      "PUSH_ACTIVATION_CODE_INVALID",
      "The activation code is not valid.",
    );
  }
}
