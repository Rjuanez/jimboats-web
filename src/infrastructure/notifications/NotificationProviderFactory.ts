import type { NotificationProvider } from "@/modules/notifications/application/ports/NotificationProvider";

import { ConsoleNotificationProvider } from "./ConsoleNotificationProvider";
import { ExternalNotificationProvider } from "./ExternalNotificationProvider";
import { PreludeWhatsappNotificationProvider } from "./PreludeWhatsappNotificationProvider";
import { ResendEmailNotificationProvider } from "./ResendEmailNotificationProvider";

type NotificationProviderMode = "console" | "external";

export function createNotificationProviderFromEnv(): NotificationProvider {
  const mode = notificationProviderModeFromEnv();

  if (mode === "console") {
    return new ConsoleNotificationProvider();
  }

  return new ExternalNotificationProvider(
    new ResendEmailNotificationProvider({
      apiKey: requiredEnv("RESEND_API_KEY"),
      baseUrl: optionalEnv("RESEND_BASE_URL"),
      from: requiredEnv("RESEND_FROM"),
      replyTo: optionalEnv("RESEND_REPLY_TO"),
    }),
    new PreludeWhatsappNotificationProvider({
      apiKey: requiredEnv("PRELUDE_API_KEY"),
      baseUrl: optionalEnv("PRELUDE_BASE_URL"),
      callbackUrl: optionalEnv("PRELUDE_CALLBACK_URL"),
      from: optionalEnv("PRELUDE_FROM"),
    }),
  );
}

function notificationProviderModeFromEnv(): NotificationProviderMode {
  const rawMode = (process.env.NOTIFICATION_PROVIDER_MODE ?? "console")
    .trim()
    .toLowerCase();

  if (rawMode === "console" || rawMode === "external") {
    return rawMode;
  }

  throw new Error(
    "NOTIFICATION_PROVIDER_MODE must be either console or external.",
  );
}

function requiredEnv(name: string) {
  const value = optionalEnv(name);

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function optionalEnv(name: string) {
  return process.env[name]?.trim() || null;
}
