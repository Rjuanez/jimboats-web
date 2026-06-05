import { domainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

export type BookingNotificationChannelValue = "EMAIL" | "WHATSAPP";
export type BookingNotificationConsentSource =
  | "BACKPANEL"
  | "BUYER_ACCESS"
  | "CHECKOUT";
export type BookingNotificationConsentStatus =
  | "GRANTED"
  | "NOT_ASKED"
  | "REVOKED";

export type BookingNotificationChannelPreferenceProps = {
  consentStatus: BookingNotificationConsentStatus;
  destination: string | null;
  enabled: boolean;
};

export type BookingNotificationPreferencesProps = {
  consentCapturedAt: Date;
  consentNotes: string;
  consentSource: BookingNotificationConsentSource;
  email: BookingNotificationChannelPreferenceProps;
  preferredLocale: string;
  whatsapp: BookingNotificationChannelPreferenceProps;
};

export type BookingNotificationChannelPreferenceSnapshot =
  BookingNotificationChannelPreferenceProps;

export type BookingNotificationPreferencesSnapshot = {
  consentCapturedAt: string;
  consentNotes: string;
  consentSource: BookingNotificationConsentSource;
  email: BookingNotificationChannelPreferenceSnapshot;
  preferredLocale: SupportedLocaleCode;
  whatsapp: BookingNotificationChannelPreferenceSnapshot;
};

const supportedConsentSources = new Set<BookingNotificationConsentSource>([
  "CHECKOUT",
  "BACKPANEL",
  "BUYER_ACCESS",
]);

const supportedConsentStatuses = new Set<BookingNotificationConsentStatus>([
  "GRANTED",
  "NOT_ASKED",
  "REVOKED",
]);

export class BookingNotificationPreferences {
  private constructor(
    private readonly props: Omit<
      BookingNotificationPreferencesSnapshot,
      "consentCapturedAt" | "preferredLocale"
    > & {
      consentCapturedAt: Date;
      preferredLocale: LocaleCode;
    },
  ) {}

  static create(input: BookingNotificationPreferencesProps) {
    const consentSource = normalizeConsentSource(input.consentSource);

    assertDate(input.consentCapturedAt);

    return new BookingNotificationPreferences({
      consentCapturedAt: input.consentCapturedAt,
      consentNotes: normalizeText(input.consentNotes),
      consentSource,
      email: normalizeChannelPreference("EMAIL", input.email),
      preferredLocale: LocaleCode.create(input.preferredLocale),
      whatsapp: normalizeChannelPreference("WHATSAPP", input.whatsapp),
    });
  }

  get preferredLocale() {
    return this.props.preferredLocale;
  }

  canUseChannel(channel: BookingNotificationChannelValue) {
    const preference = this.getChannelPreference(channel);

    return preference.enabled && preference.consentStatus === "GRANTED";
  }

  getDestinationForChannel(channel: BookingNotificationChannelValue) {
    if (!this.canUseChannel(channel)) {
      throw domainError(
        "BOOKING_NOTIFICATION_CHANNEL_NOT_ALLOWED",
        "Booking notification channel is not allowed.",
      );
    }

    return this.getChannelPreference(channel).destination;
  }

  withChannelPreference(input: {
    channel: BookingNotificationChannelValue;
    consentCapturedAt: Date;
    consentNotes: string;
    consentSource: BookingNotificationConsentSource;
    preference: BookingNotificationChannelPreferenceProps;
  }) {
    return BookingNotificationPreferences.create({
      consentCapturedAt: input.consentCapturedAt,
      consentNotes: input.consentNotes,
      consentSource: input.consentSource,
      email:
        input.channel === "EMAIL"
          ? input.preference
          : this.props.email,
      preferredLocale: this.props.preferredLocale.value,
      whatsapp:
        input.channel === "WHATSAPP"
          ? input.preference
          : this.props.whatsapp,
    });
  }

  equals(other: BookingNotificationPreferences) {
    return JSON.stringify(this.toSnapshot()) === JSON.stringify(other.toSnapshot());
  }

  toSnapshot(): BookingNotificationPreferencesSnapshot {
    return {
      consentCapturedAt: this.props.consentCapturedAt.toISOString(),
      consentNotes: this.props.consentNotes,
      consentSource: this.props.consentSource,
      email: { ...this.props.email },
      preferredLocale: this.props.preferredLocale.value,
      whatsapp: { ...this.props.whatsapp },
    };
  }

  private getChannelPreference(channel: BookingNotificationChannelValue) {
    if (channel === "EMAIL") {
      return this.props.email;
    }

    if (channel === "WHATSAPP") {
      return this.props.whatsapp;
    }

    throw domainError(
      "BOOKING_NOTIFICATION_CHANNEL_NOT_ALLOWED",
      "Booking notification channel is not supported.",
    );
  }
}

function normalizeChannelPreference(
  channel: BookingNotificationChannelValue,
  input: BookingNotificationChannelPreferenceProps,
): BookingNotificationChannelPreferenceSnapshot {
  const consentStatus = normalizeConsentStatus(input.consentStatus);
  const destination = normalizeDestination(channel, input.destination);

  if ((input.enabled || consentStatus === "GRANTED") && !destination) {
    throw domainError(
      "BOOKING_NOTIFICATION_DESTINATION_MISSING",
      "Enabled booking notification channel requires a destination.",
    );
  }

  return {
    consentStatus,
    destination,
    enabled: input.enabled,
  };
}

function normalizeDestination(
  channel: BookingNotificationChannelValue,
  destination: string | null,
) {
  const value = normalizeText(destination ?? "");

  if (!value) {
    return null;
  }

  if (channel === "EMAIL") {
    const email = value.toLowerCase();

    if (!isValidEmail(email)) {
      throw domainError(
        "BOOKING_NOTIFICATION_DESTINATION_INVALID",
        "Booking notification email destination is invalid.",
      );
    }

    return email;
  }

  if (!isValidPhone(value)) {
    throw domainError(
      "BOOKING_NOTIFICATION_DESTINATION_INVALID",
      "Booking notification WhatsApp destination is invalid.",
    );
  }

  return value;
}

function normalizeConsentSource(
  source: BookingNotificationConsentSource,
): BookingNotificationConsentSource {
  if (!supportedConsentSources.has(source)) {
    throw domainError(
      "BOOKING_NOTIFICATION_CONSENT_INVALID",
      "Booking notification consent source is invalid.",
    );
  }

  return source;
}

function normalizeConsentStatus(
  status: BookingNotificationConsentStatus,
): BookingNotificationConsentStatus {
  if (!supportedConsentStatuses.has(status)) {
    throw domainError(
      "BOOKING_NOTIFICATION_CONSENT_INVALID",
      "Booking notification consent status is invalid.",
    );
  }

  return status;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function assertDate(value: Date) {
  if (Number.isNaN(value.getTime())) {
    throw domainError(
      "BOOKING_NOTIFICATION_CONSENT_INVALID",
      "Booking notification consent date is invalid.",
    );
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length >= 6 && /^[+]?[\d\s().-]+$/.test(value);
}
