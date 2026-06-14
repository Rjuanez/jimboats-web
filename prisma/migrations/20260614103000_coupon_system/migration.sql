CREATE TYPE "CouponStatus" AS ENUM ('ACTIVE', 'DRAFT', 'EXPIRED', 'PAUSED');
CREATE TYPE "CouponVersionStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT');
CREATE TYPE "CouponDiscountType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE');
CREATE TYPE "CouponRedemptionStatus" AS ENUM ('CONFIRMED', 'REFUNDED', 'RELEASED', 'RESERVED', 'VOIDED');
CREATE TYPE "CouponEventType" AS ENUM ('COUPON_CONFIRMED', 'COUPON_CREATED', 'COUPON_RELEASED', 'COUPON_RESERVED', 'COUPON_VERSION_CREATED');
CREATE TYPE "CouponActorType" AS ENUM ('ADMIN', 'CUSTOMER', 'SYSTEM');

ALTER TABLE "bookings"
  ADD COLUMN "subtotal_amount_minor" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "subtotal_currency" TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN "discount_amount_minor" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "discount_currency" TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN "coupon_snapshot" JSONB;

UPDATE "bookings"
SET
  "subtotal_amount_minor" = "total_amount_minor",
  "subtotal_currency" = "total_currency",
  "discount_currency" = "total_currency"
WHERE "subtotal_amount_minor" = 0;

CREATE TABLE "coupons" (
  "id" TEXT NOT NULL,
  "code_normalized" TEXT NOT NULL,
  "display_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "campaign_name" TEXT NOT NULL DEFAULT '',
  "status" "CouponStatus" NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coupon_versions" (
  "id" TEXT NOT NULL,
  "coupon_id" TEXT NOT NULL,
  "version_number" INTEGER NOT NULL,
  "status" "CouponVersionStatus" NOT NULL,
  "discount_type" "CouponDiscountType" NOT NULL,
  "discount_amount_minor" INTEGER,
  "discount_percentage_bps" INTEGER,
  "currency" TEXT NOT NULL,
  "valid_from" TIMESTAMPTZ(3) NOT NULL,
  "valid_until" TIMESTAMPTZ(3),
  "max_total_redemptions" INTEGER,
  "experience_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "coupon_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coupon_redemptions" (
  "id" TEXT NOT NULL,
  "coupon_id" TEXT NOT NULL,
  "coupon_version_id" TEXT NOT NULL,
  "booking_id" TEXT NOT NULL,
  "payment_record_id" TEXT,
  "customer_email_normalized" TEXT NOT NULL,
  "status" "CouponRedemptionStatus" NOT NULL,
  "discount_amount_minor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "original_total_amount_minor" INTEGER NOT NULL,
  "final_total_amount_minor" INTEGER NOT NULL,
  "original_deposit_amount_minor" INTEGER NOT NULL,
  "final_deposit_amount_minor" INTEGER NOT NULL,
  "original_cash_remaining_amount_minor" INTEGER NOT NULL,
  "final_cash_remaining_amount_minor" INTEGER NOT NULL,
  "coupon_snapshot" JSONB NOT NULL,
  "reserved_at" TIMESTAMPTZ(3) NOT NULL,
  "confirmed_at" TIMESTAMPTZ(3),
  "released_at" TIMESTAMPTZ(3),
  "voided_at" TIMESTAMPTZ(3),
  CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coupon_events" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "coupon_id" TEXT NOT NULL,
  "coupon_version_id" TEXT,
  "redemption_id" TEXT,
  "booking_id" TEXT,
  "type" "CouponEventType" NOT NULL,
  "actor_type" "CouponActorType" NOT NULL,
  "actor_id" TEXT,
  "metadata_json" JSONB NOT NULL,
  "occurred_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "coupon_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "coupons_code_normalized_key" ON "coupons"("code_normalized");
CREATE INDEX "coupons_status_idx" ON "coupons"("status");
CREATE UNIQUE INDEX "coupon_versions_coupon_id_version_number_key" ON "coupon_versions"("coupon_id", "version_number");
CREATE INDEX "coupon_versions_coupon_status_idx" ON "coupon_versions"("coupon_id", "status");
CREATE INDEX "coupon_versions_valid_range_idx" ON "coupon_versions"("valid_from", "valid_until");
CREATE UNIQUE INDEX "coupon_redemptions_booking_id_key" ON "coupon_redemptions"("booking_id");
CREATE INDEX "coupon_redemptions_coupon_status_idx" ON "coupon_redemptions"("coupon_id", "status");
CREATE INDEX "coupon_redemptions_version_status_idx" ON "coupon_redemptions"("coupon_version_id", "status");
CREATE INDEX "coupon_redemptions_customer_email_idx" ON "coupon_redemptions"("customer_email_normalized");
CREATE INDEX "coupon_events_coupon_occurred_idx" ON "coupon_events"("coupon_id", "occurred_at");
CREATE INDEX "coupon_events_booking_id_idx" ON "coupon_events"("booking_id");
CREATE INDEX "coupon_events_redemption_id_idx" ON "coupon_events"("redemption_id");

ALTER TABLE "coupon_versions"
  ADD CONSTRAINT "coupon_versions_coupon_id_fkey"
  FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coupon_redemptions"
  ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey"
  FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "coupon_redemptions_coupon_version_id_fkey"
  FOREIGN KEY ("coupon_version_id") REFERENCES "coupon_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "coupon_redemptions_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coupon_events"
  ADD CONSTRAINT "coupon_events_coupon_id_fkey"
  FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "coupon_events_coupon_version_id_fkey"
  FOREIGN KEY ("coupon_version_id") REFERENCES "coupon_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "coupon_events_redemption_id_fkey"
  FOREIGN KEY ("redemption_id") REFERENCES "coupon_redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "coupons" (
  "id",
  "code_normalized",
  "display_code",
  "name",
  "campaign_name",
  "status",
  "created_at",
  "updated_at"
) VALUES (
  'coupon-test10',
  'TEST10',
  'TEST10',
  'Test 10 percent discount',
  'Initial coupon test',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("code_normalized") DO NOTHING;

INSERT INTO "coupon_versions" (
  "id",
  "coupon_id",
  "version_number",
  "status",
  "discount_type",
  "discount_percentage_bps",
  "currency",
  "valid_from",
  "experience_ids",
  "created_at"
) VALUES (
  'coupon-version-test10-v1',
  'coupon-test10',
  1,
  'ACTIVE',
  'PERCENTAGE',
  1000,
  'EUR',
  '2026-01-01T00:00:00.000Z',
  ARRAY[]::TEXT[],
  CURRENT_TIMESTAMP
) ON CONFLICT ("coupon_id", "version_number") DO NOTHING;

INSERT INTO "coupon_events" (
  "coupon_id",
  "coupon_version_id",
  "type",
  "actor_type",
  "actor_id",
  "metadata_json",
  "occurred_at"
) VALUES
  (
    'coupon-test10',
    NULL,
    'COUPON_CREATED',
    'SYSTEM',
    'migration:20260614103000_coupon_system',
    '{"displayCode":"TEST10"}',
    CURRENT_TIMESTAMP
  ),
  (
    'coupon-test10',
    'coupon-version-test10-v1',
    'COUPON_VERSION_CREATED',
    'SYSTEM',
    'migration:20260614103000_coupon_system',
    '{"discountType":"PERCENTAGE","discountPercentageBps":1000}',
    CURRENT_TIMESTAMP
  );
