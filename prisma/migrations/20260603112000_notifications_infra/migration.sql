CREATE TYPE "BookingNotificationConsentSource" AS ENUM (
  'CHECKOUT',
  'BACKPANEL',
  'BUYER_ACCESS'
);

CREATE TYPE "BookingNotificationConsentStatus" AS ENUM (
  'GRANTED',
  'NOT_ASKED',
  'REVOKED'
);

CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WHATSAPP');
CREATE TYPE "NotificationRecipientType" AS ENUM ('BUYER');
CREATE TYPE "NotificationRuleSendMode" AS ENUM ('AUTOMATIC', 'MANUAL_REVIEW');
CREATE TYPE "NotificationRuleStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "NotificationRuleLocaleStrategy" AS ENUM ('BOOKING_PREFERRED_LOCALE');
CREATE TYPE "NotificationRuleMissingTranslationBehavior" AS ENUM ('DO_NOT_SEND');
CREATE TYPE "NotificationTemplateStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT', 'READY');
CREATE TYPE "NotificationTemplateTranslationStatus" AS ENUM (
  'ARCHIVED',
  'DRAFT',
  'PUBLISHED',
  'READY'
);
CREATE TYPE "NotificationDeliveryStatus" AS ENUM (
  'CANCELLED',
  'DELIVERED',
  'FAILED',
  'MANUAL_REVIEW',
  'PENDING',
  'SENT'
);

CREATE TABLE "booking_notification_preferences" (
  "id" TEXT NOT NULL,
  "booking_id" TEXT NOT NULL,
  "preferred_locale" TEXT NOT NULL,
  "email_enabled" BOOLEAN NOT NULL,
  "email_address" TEXT,
  "email_consent_status" "BookingNotificationConsentStatus" NOT NULL,
  "whatsapp_enabled" BOOLEAN NOT NULL,
  "whatsapp_phone" TEXT,
  "whatsapp_consent_status" "BookingNotificationConsentStatus" NOT NULL,
  "consent_source" "BookingNotificationConsentSource" NOT NULL,
  "consent_notes" TEXT,
  "consent_captured_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "booking_notification_preferences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "booking_notification_preferences_booking_id_key" UNIQUE ("booking_id"),
  CONSTRAINT "booking_notification_preferences_locale_check" CHECK (
    "preferred_locale" IN ('en', 'es', 'ca')
  ),
  CONSTRAINT "booking_notification_preferences_email_check" CHECK (
    "email_enabled" = false OR length(trim(coalesce("email_address", ''))) > 0
  ),
  CONSTRAINT "booking_notification_preferences_whatsapp_check" CHECK (
    "whatsapp_enabled" = false OR length(trim(coalesce("whatsapp_phone", ''))) > 0
  ),
  CONSTRAINT "booking_notification_preferences_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "booking_notification_preferences_booking_id_idx"
  ON "booking_notification_preferences"("booking_id");
CREATE INDEX "booking_notification_preferences_locale_idx"
  ON "booking_notification_preferences"("preferred_locale");

CREATE TABLE "notification_templates" (
  "id" TEXT NOT NULL,
  "notification_type" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "status" "NotificationTemplateStatus" NOT NULL,
  "allowed_variables_json" JSONB NOT NULL,
  "required_variables_json" JSONB NOT NULL,
  "version" INTEGER NOT NULL,
  "updated_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_templates_identity_check" CHECK (
    length(trim("notification_type")) > 0
    AND length(trim("event_type")) > 0
  ),
  CONSTRAINT "notification_templates_version_check" CHECK ("version" > 0),
  CONSTRAINT "notification_templates_allowed_variables_check" CHECK (
    jsonb_typeof("allowed_variables_json") = 'array'
  ),
  CONSTRAINT "notification_templates_required_variables_check" CHECK (
    jsonb_typeof("required_variables_json") = 'array'
  )
);

CREATE INDEX "notification_templates_lookup_idx"
  ON "notification_templates"("notification_type", "channel", "status");
CREATE UNIQUE INDEX "notification_templates_active_identity_key"
  ON "notification_templates"("notification_type", "channel")
  WHERE "status" = 'ACTIVE';

CREATE TABLE "notification_template_translations" (
  "id" TEXT NOT NULL,
  "template_id" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "status" "NotificationTemplateTranslationStatus" NOT NULL,
  "subject" TEXT,
  "preview_text" TEXT,
  "body" TEXT NOT NULL,
  "variables_used_json" JSONB NOT NULL,
  "updated_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_template_translations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_template_translations_template_id_locale_key"
    UNIQUE ("template_id", "locale"),
  CONSTRAINT "notification_template_translations_locale_check" CHECK (
    "locale" IN ('en', 'es', 'ca')
  ),
  CONSTRAINT "notification_template_translations_body_check" CHECK (
    "status" NOT IN ('READY', 'PUBLISHED')
    OR length(trim("body")) > 0
  ),
  CONSTRAINT "notification_template_translations_variables_check" CHECK (
    jsonb_typeof("variables_used_json") = 'array'
  ),
  CONSTRAINT "notification_template_translations_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "notification_template_translations_template_idx"
  ON "notification_template_translations"("template_id");
CREATE INDEX "notification_template_translations_lookup_idx"
  ON "notification_template_translations"("template_id", "locale", "status");

CREATE TABLE "notification_rules" (
  "id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "notification_type" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "recipient_type" "NotificationRecipientType" NOT NULL,
  "template_id" TEXT,
  "enabled" BOOLEAN NOT NULL,
  "send_mode" "NotificationRuleSendMode" NOT NULL,
  "requires_consent" BOOLEAN NOT NULL,
  "locale_strategy" "NotificationRuleLocaleStrategy" NOT NULL,
  "missing_translation_behavior" "NotificationRuleMissingTranslationBehavior" NOT NULL,
  "status" "NotificationRuleStatus" NOT NULL,
  "updated_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_rules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_rules_identity_check" CHECK (
    length(trim("event_type")) > 0
    AND length(trim("notification_type")) > 0
  ),
  CONSTRAINT "notification_rules_enabled_template_check" CHECK (
    "enabled" = false OR "status" = 'ARCHIVED' OR "template_id" IS NOT NULL
  ),
  CONSTRAINT "notification_rules_buyer_consent_check" CHECK (
    "recipient_type" <> 'BUYER' OR "requires_consent" = true
  ),
  CONSTRAINT "notification_rules_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "notification_rules_event_idx"
  ON "notification_rules"("event_type");
CREATE INDEX "notification_rules_lookup_idx"
  ON "notification_rules"("event_type", "channel", "recipient_type", "status");
CREATE INDEX "notification_rules_template_id_idx"
  ON "notification_rules"("template_id");
CREATE UNIQUE INDEX "notification_rules_active_identity_key"
  ON "notification_rules"("event_type", "channel", "recipient_type")
  WHERE "status" = 'ACTIVE';

CREATE TABLE "notification_deliveries" (
  "id" TEXT NOT NULL,
  "outbox_message_id" TEXT,
  "rule_id" TEXT,
  "booking_id" TEXT,
  "notification_type" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "status" "NotificationDeliveryStatus" NOT NULL,
  "locale" TEXT NOT NULL,
  "recipient_type" "NotificationRecipientType" NOT NULL,
  "recipient_name" TEXT,
  "recipient_email" TEXT,
  "recipient_phone" TEXT,
  "template_id" TEXT,
  "template_version" INTEGER,
  "rendered_subject" TEXT,
  "rendered_body" TEXT NOT NULL,
  "payload_json" JSONB NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "provider" TEXT,
  "provider_message_id" TEXT,
  "failure_reason" TEXT,
  "send_after" TIMESTAMPTZ(3),
  "sent_at" TIMESTAMPTZ(3),
  "delivered_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_deliveries_identity_check" CHECK (
    length(trim("notification_type")) > 0
    AND length(trim("event_type")) > 0
  ),
  CONSTRAINT "notification_deliveries_locale_check" CHECK (
    "locale" IN ('en', 'es', 'ca')
  ),
  CONSTRAINT "notification_deliveries_attempts_check" CHECK ("attempts" >= 0),
  CONSTRAINT "notification_deliveries_rendered_body_check" CHECK (
    length(trim("rendered_body")) > 0
  ),
  CONSTRAINT "notification_deliveries_email_recipient_check" CHECK (
    "channel" <> 'EMAIL' OR length(trim(coalesce("recipient_email", ''))) > 0
  ),
  CONSTRAINT "notification_deliveries_whatsapp_recipient_check" CHECK (
    "channel" <> 'WHATSAPP' OR length(trim(coalesce("recipient_phone", ''))) > 0
  ),
  CONSTRAINT "notification_deliveries_provider_message_check" CHECK (
    "provider_message_id" IS NULL OR "provider" IS NOT NULL
  ),
  CONSTRAINT "notification_deliveries_template_version_check" CHECK (
    "template_version" IS NULL OR "template_version" > 0
  ),
  CONSTRAINT "notification_deliveries_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "notification_deliveries_outbox_message_id_fkey"
    FOREIGN KEY ("outbox_message_id") REFERENCES "outbox_messages"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "notification_deliveries_rule_id_fkey"
    FOREIGN KEY ("rule_id") REFERENCES "notification_rules"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "notification_deliveries_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "notification_deliveries_status_send_after_idx"
  ON "notification_deliveries"("status", "send_after");
CREATE INDEX "notification_deliveries_booking_id_idx"
  ON "notification_deliveries"("booking_id");
CREATE INDEX "notification_deliveries_channel_status_idx"
  ON "notification_deliveries"("channel", "status");
CREATE INDEX "notification_deliveries_outbox_rule_idx"
  ON "notification_deliveries"("outbox_message_id", "rule_id");
CREATE UNIQUE INDEX "notification_deliveries_outbox_rule_key"
  ON "notification_deliveries"("outbox_message_id", "rule_id")
  WHERE "outbox_message_id" IS NOT NULL AND "rule_id" IS NOT NULL;
