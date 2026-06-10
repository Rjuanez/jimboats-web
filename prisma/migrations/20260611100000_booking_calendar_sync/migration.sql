ALTER TABLE "bookings"
  ADD COLUMN "external_calendar_event_id" TEXT,
  ADD COLUMN "external_calendar_synced_at" TIMESTAMPTZ(3),
  ADD COLUMN "external_calendar_sync_error" TEXT;

CREATE UNIQUE INDEX "bookings_external_calendar_event_id_key"
  ON "bookings"("external_calendar_event_id");
