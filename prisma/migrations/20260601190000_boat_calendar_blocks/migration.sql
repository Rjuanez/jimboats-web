CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE "CalendarBlockSource" AS ENUM ('MANUAL_BLOCK');
CREATE TYPE "CalendarBlockStatus" AS ENUM ('ACTIVE', 'RELEASED');

CREATE TABLE "calendar_blocks" (
  "id" TEXT NOT NULL,
  "source" "CalendarBlockSource" NOT NULL,
  "status" "CalendarBlockStatus" NOT NULL,
  "local_date" DATE NOT NULL,
  "visible_start_minutes" INTEGER NOT NULL,
  "visible_end_minutes" INTEGER NOT NULL,
  "protected_start_at" TIMESTAMPTZ(3) NOT NULL,
  "protected_end_at" TIMESTAMPTZ(3) NOT NULL,
  "timezone" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "created_by_user_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "calendar_blocks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "calendar_blocks_visible_range_check" CHECK (
    "visible_start_minutes" >= 0
    AND "visible_end_minutes" <= 1440
    AND "visible_end_minutes" > "visible_start_minutes"
  ),
  CONSTRAINT "calendar_blocks_protected_range_check" CHECK (
    "protected_end_at" > "protected_start_at"
  ),
  CONSTRAINT "calendar_blocks_reason_check" CHECK (length(trim("reason")) > 0),
  CONSTRAINT "calendar_blocks_timezone_check" CHECK (length(trim("timezone")) > 0),
  CONSTRAINT "calendar_blocks_created_by_user_id_check" CHECK (
    length(trim("created_by_user_id")) > 0
  )
);

CREATE INDEX "calendar_blocks_local_date_idx" ON "calendar_blocks"("local_date");
CREATE INDEX "calendar_blocks_protected_range_idx"
  ON "calendar_blocks"("protected_start_at", "protected_end_at");
CREATE INDEX "calendar_blocks_status_source_idx"
  ON "calendar_blocks"("status", "source");

ALTER TABLE "calendar_blocks"
  ADD CONSTRAINT "calendar_blocks_active_protected_range_no_overlap"
  EXCLUDE USING gist (
    tstzrange("protected_start_at", "protected_end_at", '[)') WITH &&
  )
  WHERE ("status" = 'ACTIVE');
