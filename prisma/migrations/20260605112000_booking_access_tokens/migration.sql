CREATE TYPE "BookingAccessTokenStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

CREATE TABLE "booking_access_tokens" (
  "id" TEXT NOT NULL,
  "booking_id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "algorithm" TEXT NOT NULL,
  "access_path" TEXT NOT NULL,
  "status" "BookingAccessTokenStatus" NOT NULL,
  "issued_at" TIMESTAMPTZ(3) NOT NULL,
  "expires_at" TIMESTAMPTZ(3),
  "last_access_at" TIMESTAMPTZ(3),
  "revoked_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "booking_access_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "booking_access_tokens_token_hash_key" ON "booking_access_tokens"("token_hash");
CREATE INDEX "booking_access_tokens_booking_id_idx" ON "booking_access_tokens"("booking_id");
CREATE INDEX "booking_access_tokens_status_idx" ON "booking_access_tokens"("status");
CREATE INDEX "booking_access_tokens_expires_at_idx" ON "booking_access_tokens"("expires_at");

ALTER TABLE "booking_access_tokens"
  ADD CONSTRAINT "booking_access_tokens_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
