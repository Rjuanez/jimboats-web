CREATE TYPE "PushSubscriptionPlatform" AS ENUM ('ANDROID', 'DESKTOP', 'IOS', 'UNKNOWN');
CREATE TYPE "PushSubscriptionPermission" AS ENUM ('DEFAULT', 'DENIED', 'GRANTED');
CREATE TYPE "PushSubscriptionStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "PushDeliveryAttemptStatus" AS ENUM ('FAILED', 'SENT');

CREATE TABLE "push_subscriptions" (
  "id" text NOT NULL DEFAULT gen_random_uuid()::text,
  "label" text NOT NULL,
  "endpoint" text NOT NULL,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL,
  "platform" "PushSubscriptionPlatform" NOT NULL,
  "permission" "PushSubscriptionPermission" NOT NULL,
  "status" "PushSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "user_agent" text,
  "display_mode" text,
  "last_test_sent_at" timestamptz(3),
  "last_success_at" timestamptz(3),
  "last_failure_at" timestamptz(3),
  "last_failure_reason" text,
  "disabled_at" timestamptz(3),
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "push_subscriptions_label_check" CHECK (length(trim("label")) > 0),
  CONSTRAINT "push_subscriptions_endpoint_check" CHECK (length(trim("endpoint")) > 0),
  CONSTRAINT "push_subscriptions_keys_check" CHECK (
    length(trim("p256dh")) > 0 AND length(trim("auth")) > 0
  )
);

CREATE UNIQUE INDEX "push_subscriptions_endpoint_key"
  ON "push_subscriptions"("endpoint");
CREATE INDEX "push_subscriptions_status_updated_at_idx"
  ON "push_subscriptions"("status", "updated_at");
CREATE INDEX "push_subscriptions_platform_idx"
  ON "push_subscriptions"("platform");

CREATE TABLE "push_delivery_attempts" (
  "id" text NOT NULL DEFAULT gen_random_uuid()::text,
  "subscription_id" text NOT NULL,
  "booking_id" text,
  "event_type" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "url" text NOT NULL,
  "status" "PushDeliveryAttemptStatus" NOT NULL,
  "provider" text NOT NULL,
  "failure_reason" text,
  "sent_at" timestamptz(3) NOT NULL,
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "push_delivery_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "push_delivery_attempts_subscription_id_fkey"
    FOREIGN KEY ("subscription_id") REFERENCES "push_subscriptions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "push_delivery_attempts_message_check" CHECK (
    length(trim("event_type")) > 0
    AND length(trim("title")) > 0
    AND length(trim("body")) > 0
    AND length(trim("url")) > 0
    AND length(trim("provider")) > 0
  )
);

CREATE INDEX "push_delivery_attempts_subscription_sent_at_idx"
  ON "push_delivery_attempts"("subscription_id", "sent_at");
CREATE INDEX "push_delivery_attempts_booking_event_idx"
  ON "push_delivery_attempts"("booking_id", "event_type");
