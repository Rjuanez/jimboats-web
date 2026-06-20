ALTER TABLE "bookings"
  ADD COLUMN "checkout_last_seen_at" TIMESTAMPTZ(3);

CREATE INDEX "bookings_payment_hold_expiration_idx"
  ON "bookings" ("status", "hold_expires_at", "checkout_last_seen_at");
