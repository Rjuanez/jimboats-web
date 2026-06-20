ALTER TABLE "bookings" ADD COLUMN "operations_seen_at" TIMESTAMPTZ(3);

CREATE INDEX "bookings_operations_seen_idx" ON "bookings"("status", "operations_seen_at");
