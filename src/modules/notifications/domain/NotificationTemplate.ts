import { domainError } from "@/shared/domain/DomainError";
import { LocaleCode } from "@/shared/domain/LocaleCode";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

import type { NotificationChannel } from "./NotificationChannel";
import type { NotificationType } from "./NotificationType";

export type NotificationTemplateStatus =
  | "ACTIVE"
  | "ARCHIVED"
  | "DRAFT"
  | "READY";
export type NotificationTemplateTranslationStatus =
  | "ARCHIVED"
  | "DRAFT"
  | "PUBLISHED"
  | "READY";

export type NotificationTemplateTranslationProps = {
  body: string;
  locale: LocaleCode;
  previewText: string | null;
  status: NotificationTemplateTranslationStatus;
  subject: string | null;
  updatedAt: Date;
  updatedByUserId: string | null;
};

export type NotificationTemplateTranslationSnapshot = {
  body: string;
  locale: SupportedLocaleCode;
  previewText: string | null;
  status: NotificationTemplateTranslationStatus;
  subject: string | null;
  updatedAt: string;
  updatedByUserId: string | null;
  variablesUsed: string[];
};

export type NotificationTemplateProps = {
  allowedVariables: string[];
  channel: NotificationChannel;
  eventType: string;
  id: string;
  notificationType: NotificationType;
  providerTemplateId: string | null;
  requiredVariables: string[];
  status: NotificationTemplateStatus;
  translations: NotificationTemplateTranslationProps[];
  updatedAt: Date;
  updatedByUserId: string | null;
  version: number;
};

export type NotificationTemplateSnapshot = {
  allowedVariables: string[];
  channel: ReturnType<NotificationChannel["toString"]>;
  eventType: string;
  id: string;
  notificationType: ReturnType<NotificationType["toString"]>;
  providerTemplateId: string | null;
  requiredVariables: string[];
  status: NotificationTemplateStatus;
  translations: NotificationTemplateTranslationSnapshot[];
  updatedAt: string;
  updatedByUserId: string | null;
  version: number;
};

const supportedStatuses = new Set<NotificationTemplateStatus>([
  "DRAFT",
  "READY",
  "ACTIVE",
  "ARCHIVED",
]);

const supportedTranslationStatuses =
  new Set<NotificationTemplateTranslationStatus>([
    "DRAFT",
    "READY",
    "PUBLISHED",
    "ARCHIVED",
  ]);

export class NotificationTemplate {
  private constructor(
    private readonly props: Omit<NotificationTemplateProps, "translations"> & {
      translations: NotificationTemplateTranslation[];
    },
  ) {}

  static create(input: NotificationTemplateProps) {
    const id = input.id.trim();
    const eventType = input.eventType.trim();
    const providerTemplateId = normalizeOptionalText(input.providerTemplateId);
    const updatedByUserId = input.updatedByUserId?.trim() || null;
    const allowedVariables = normalizeVariables(input.allowedVariables);
    const requiredVariables = normalizeVariables(input.requiredVariables);

    if (!id || !eventType) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_INVALID",
        "Notification template requires id and event type.",
      );
    }

    if (!supportedStatuses.has(input.status)) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_INVALID",
        "Notification template status is invalid.",
      );
    }

    if (!Number.isInteger(input.version) || input.version <= 0) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_INVALID",
        "Notification template version must be positive.",
      );
    }

    assertRequiredVariablesAreAllowed(requiredVariables, allowedVariables);
    assertDate(input.updatedAt, "Notification template update date is invalid.");

    const translations = input.translations.map((translation) =>
      NotificationTemplateTranslation.create({
        ...translation,
        allowedVariables,
        channel: input.channel,
        requiredVariables,
      }),
    );

    if (
      input.status === "ACTIVE" &&
      !translations.some((translation) => translation.status === "PUBLISHED")
    ) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_TRANSLATION_MISSING",
        "Active notification template requires at least one published translation.",
      );
    }

    return new NotificationTemplate({
      ...input,
      allowedVariables,
      eventType,
      id,
      providerTemplateId,
      requiredVariables,
      translations,
      updatedByUserId,
    });
  }

  get id() {
    return this.props.id;
  }

  get status() {
    return this.props.status;
  }

  getMissingPublishedLocales(locales: SupportedLocaleCode[]) {
    const publishedLocales = new Set(
      this.props.translations
        .filter((translation) => translation.status === "PUBLISHED")
        .map((translation) => translation.locale.value),
    );

    return locales.filter((locale) => !publishedLocales.has(locale));
  }

  hasPublishedTranslationFor(locale: SupportedLocaleCode) {
    return this.getMissingPublishedLocales([locale]).length === 0;
  }

  assertCanSendAutomatically(locales: SupportedLocaleCode[]) {
    const missingLocales = this.getMissingPublishedLocales(locales);

    if (this.props.status !== "ACTIVE" || missingLocales.length > 0) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_TRANSLATION_MISSING",
        "Notification template is missing published translations.",
      );
    }
  }

  upsertTranslation(
    input: NotificationTemplateTranslationProps & {
      updatedAt: Date;
      updatedByUserId: string | null;
    },
  ) {
    const nextTranslations = this.props.translations
      .filter((translation) => !translation.locale.equals(input.locale))
      .map((translation) => translation.toProps());

    nextTranslations.push(input);

    return NotificationTemplate.create({
      ...this.props,
      translations: nextTranslations,
      updatedAt: input.updatedAt,
      updatedByUserId: input.updatedByUserId,
    });
  }

  activate(input: {
    requiredLocales: SupportedLocaleCode[];
    updatedAt: Date;
    updatedByUserId: string | null;
  }) {
    const nextTemplate = NotificationTemplate.create({
      ...this.props,
      status: "ACTIVE",
      translations: this.props.translations.map((translation) =>
        translation.toProps(),
      ),
      updatedAt: input.updatedAt,
      updatedByUserId: input.updatedByUserId,
    });

    nextTemplate.assertCanSendAutomatically(input.requiredLocales);

    return nextTemplate;
  }

  archive(input: { updatedAt: Date; updatedByUserId: string | null }) {
    return NotificationTemplate.create({
      ...this.props,
      status: "ARCHIVED",
      translations: this.props.translations.map((translation) =>
        translation.toProps(),
      ),
      updatedAt: input.updatedAt,
      updatedByUserId: input.updatedByUserId,
    });
  }

  toSnapshot(): NotificationTemplateSnapshot {
    return {
      allowedVariables: [...this.props.allowedVariables],
      channel: this.props.channel.toString(),
      eventType: this.props.eventType,
      id: this.props.id,
      notificationType: this.props.notificationType.toString(),
      providerTemplateId: this.props.providerTemplateId,
      requiredVariables: [...this.props.requiredVariables],
      status: this.props.status,
      translations: this.props.translations.map((translation) =>
        translation.toSnapshot(),
      ),
      updatedAt: this.props.updatedAt.toISOString(),
      updatedByUserId: this.props.updatedByUserId,
      version: this.props.version,
    };
  }
}

class NotificationTemplateTranslation {
  private constructor(
    readonly body: string,
    readonly locale: LocaleCode,
    readonly previewText: string | null,
    readonly status: NotificationTemplateTranslationStatus,
    readonly subject: string | null,
    readonly updatedAt: Date,
    readonly updatedByUserId: string | null,
    readonly variablesUsed: string[],
  ) {}

  static create(
    input: NotificationTemplateTranslationProps & {
      allowedVariables: string[];
      channel: NotificationChannel;
      requiredVariables: string[];
    },
  ) {
    const body = normalizeBody(input.body);
    const subject = normalizeOptionalText(input.subject);
    const previewText = normalizeOptionalText(input.previewText);
    const updatedByUserId = input.updatedByUserId?.trim() || null;

    if (!supportedTranslationStatuses.has(input.status)) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_TRANSLATION_INVALID",
        "Notification template translation status is invalid.",
      );
    }

    assertDate(
      input.updatedAt,
      "Notification template translation update date is invalid.",
    );

    if (["PUBLISHED", "READY"].includes(input.status) && !body) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_TRANSLATION_INVALID",
        "Ready notification template translation requires a body.",
      );
    }

    if (
      input.channel.value === "EMAIL" &&
      ["PUBLISHED", "READY"].includes(input.status) &&
      !subject
    ) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_SUBJECT_REQUIRED",
        "Ready email notification template translation requires a subject.",
      );
    }

    const variablesUsed = extractVariables([subject, previewText, body]);

    assertVariablesAreAllowed(variablesUsed, input.allowedVariables);

    if (input.status === "PUBLISHED") {
      assertRequiredVariablesAreUsed(variablesUsed, input.requiredVariables);
    }

    return new NotificationTemplateTranslation(
      body,
      input.locale,
      previewText,
      input.status,
      input.channel.value === "EMAIL" ? subject : null,
      input.updatedAt,
      updatedByUserId,
      variablesUsed,
    );
  }

  toProps(): NotificationTemplateTranslationProps {
    return {
      body: this.body,
      locale: this.locale,
      previewText: this.previewText,
      status: this.status,
      subject: this.subject,
      updatedAt: this.updatedAt,
      updatedByUserId: this.updatedByUserId,
    };
  }

  toSnapshot(): NotificationTemplateTranslationSnapshot {
    return {
      body: this.body,
      locale: this.locale.value,
      previewText: this.previewText,
      status: this.status,
      subject: this.subject,
      updatedAt: this.updatedAt.toISOString(),
      updatedByUserId: this.updatedByUserId,
      variablesUsed: [...this.variablesUsed],
    };
  }
}

function normalizeVariables(values: string[]) {
  const normalizedVariables = values
    .map((value) => value.trim())
    .filter(Boolean);

  for (const variable of normalizedVariables) {
    if (!/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i.test(variable)) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_VARIABLE_INVALID",
        "Notification template variable name is invalid.",
      );
    }
  }

  return [...new Set(normalizedVariables)].sort();
}

function assertRequiredVariablesAreAllowed(
  requiredVariables: string[],
  allowedVariables: string[],
) {
  for (const variable of requiredVariables) {
    if (!allowedVariables.includes(variable)) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_VARIABLE_INVALID",
        "Notification template required variable must be allowed.",
      );
    }
  }
}

function assertVariablesAreAllowed(
  variablesUsed: string[],
  allowedVariables: string[],
) {
  for (const variable of variablesUsed) {
    if (!allowedVariables.includes(variable)) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_VARIABLE_INVALID",
        "Notification template content uses a variable that is not allowed.",
      );
    }
  }
}

function assertRequiredVariablesAreUsed(
  variablesUsed: string[],
  requiredVariables: string[],
) {
  for (const variable of requiredVariables) {
    if (!variablesUsed.includes(variable)) {
      throw domainError(
        "NOTIFICATION_TEMPLATE_TRANSLATION_INVALID",
        "Published notification template translation is missing required variables.",
      );
    }
  }
}

function extractVariables(values: Array<string | null>) {
  const variables = new Set<string>();
  const pattern = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g;

  for (const value of values) {
    if (!value) {
      continue;
    }

    for (const match of value.matchAll(pattern)) {
      variables.add(match[1]);
    }
  }

  return [...variables].sort();
}

function normalizeOptionalText(value: string | null) {
  const normalized = normalizeBody(value ?? "");

  return normalized || null;
}

function normalizeBody(value: string) {
  return value.trim().replace(/[ \t]+/g, " ");
}

function assertDate(value: Date, message: string) {
  if (Number.isNaN(value.getTime())) {
    throw domainError("NOTIFICATION_TEMPLATE_INVALID", message);
  }
}
