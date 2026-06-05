ALTER TYPE "CalendarBlockSource" ADD VALUE IF NOT EXISTS 'BOOKING_HOLD';

CREATE TYPE "PaymentProviderEventStatus" AS ENUM (
  'FAILED',
  'IGNORED',
  'PROCESSED'
);

CREATE TABLE "payment_provider_events" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "provider" TEXT NOT NULL,
  "provider_event_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "status" "PaymentProviderEventStatus" NOT NULL,
  "payload_json" JSONB NOT NULL,
  "failure_reason" TEXT,
  "received_at" TIMESTAMPTZ(3) NOT NULL,
  "processed_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_provider_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_provider_events_identity_check" CHECK (
    length(trim("provider")) > 0
    AND length(trim("provider_event_id")) > 0
    AND length(trim("event_type")) > 0
  ),
  CONSTRAINT "payment_provider_events_provider_event_key"
    UNIQUE ("provider", "provider_event_id")
);

CREATE INDEX "payment_records_provider_session_id_idx"
  ON "payment_records"("provider_session_id");

CREATE INDEX "payment_records_provider_payment_intent_id_idx"
  ON "payment_records"("provider_payment_intent_id");

CREATE INDEX "payment_provider_events_provider_event_id_idx"
  ON "payment_provider_events"("provider_event_id");

CREATE INDEX "payment_provider_events_status_received_at_idx"
  ON "payment_provider_events"("status", "received_at");
