import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type { NotificationPayload } from "../../domain/NotificationDelivery";

export type NotificationBookingChannelConsentStatus =
  | "GRANTED"
  | "NOT_ASKED"
  | "REVOKED";

export type NotificationBookingChannelPreferenceReadModel = {
  consentStatus: NotificationBookingChannelConsentStatus;
  destination: string | null;
  enabled: boolean;
};

export type NotificationBookingReadModel = {
  customerName: string | null;
  id: string;
  notificationPreferences: {
    email: NotificationBookingChannelPreferenceReadModel;
    preferredLocale: SupportedLocaleCode;
    whatsapp: NotificationBookingChannelPreferenceReadModel;
  };
  reference: string;
  templatePayload: NotificationPayload;
};

export type NotificationBookingReader = {
  findNotificationBookingById(
    bookingId: string,
  ): Promise<NotificationBookingReadModel | null>;
};
