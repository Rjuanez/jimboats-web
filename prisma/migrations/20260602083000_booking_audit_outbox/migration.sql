CREATE TYPE "OutboxMessageStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

CREATE TABLE "audit_entries" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "actor_user_id" TEXT,
  "action" TEXT NOT NULL,
  "resource_type" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "reason" TEXT,
  "diff_json" JSONB,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "outbox_messages" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "aggregate_type" TEXT NOT NULL,
  "aggregate_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "event_version" INTEGER NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "OutboxMessageStatus" NOT NULL DEFAULT 'PENDING',
  "occurred_at" TIMESTAMPTZ(3) NOT NULL,
  "published_at" TIMESTAMPTZ(3),
  "failure_reason" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "outbox_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_entries_resource_idx" ON "audit_entries"("resource_type", "resource_id");
CREATE INDEX "audit_entries_actor_idx" ON "audit_entries"("actor_user_id");
CREATE INDEX "audit_entries_created_at_idx" ON "audit_entries"("created_at");

CREATE INDEX "outbox_messages_status_created_at_idx" ON "outbox_messages"("status", "created_at");
CREATE INDEX "outbox_messages_aggregate_idx" ON "outbox_messages"("aggregate_type", "aggregate_id");
CREATE INDEX "outbox_messages_event_type_idx" ON "outbox_messages"("event_type");
