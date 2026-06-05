ALTER TYPE "CalendarBlockSource" ADD VALUE 'BOOKING_CONFIRMED';

CREATE TYPE "BookingStatus" AS ENUM (
  'PENDING_PAYMENT',
  'CONFIRMED',
  'EXPIRED',
  'PAYMENT_FAILED',
  'CANCELLED'
);

CREATE TYPE "BookingSource" AS ENUM ('PUBLIC_CHECKOUT', 'BACKPANEL');

CREATE TYPE "PaymentRecordStatus" AS ENUM (
  'PENDING',
  'SUCCEEDED',
  'MANUALLY_PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED'
);

ALTER TABLE "calendar_blocks"
  ADD COLUMN "booking_id" TEXT,
  ADD COLUMN "experience_id" TEXT,
  ADD COLUMN "expires_at" TIMESTAMPTZ(3);

CREATE INDEX "calendar_blocks_booking_id_idx" ON "calendar_blocks"("booking_id");
CREATE INDEX "calendar_blocks_experience_id_idx" ON "calendar_blocks"("experience_id");

CREATE TABLE "bookings" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "status" "BookingStatus" NOT NULL,
  "source" "BookingSource" NOT NULL,
  "experience_id" TEXT NOT NULL,
  "experience_name_snapshot" TEXT NOT NULL,
  "calendar_block_id" TEXT NOT NULL,
  "payment_record_id" TEXT NOT NULL,
  "guest_count" INTEGER NOT NULL,
  "customer_name" TEXT NOT NULL,
  "customer_email" TEXT NOT NULL,
  "customer_phone" TEXT,
  "customer_locale" TEXT NOT NULL,
  "customer_notes" TEXT NOT NULL DEFAULT '',
  "selected_local_date" DATE NOT NULL,
  "selected_start_minutes" INTEGER NOT NULL,
  "selected_end_minutes" INTEGER NOT NULL,
  "selected_slot_key" TEXT,
  "timezone" TEXT NOT NULL,
  "total_amount_minor" INTEGER NOT NULL,
  "total_currency" TEXT NOT NULL,
  "deposit_amount_minor" INTEGER NOT NULL,
  "deposit_currency" TEXT NOT NULL,
  "cash_remaining_amount_minor" INTEGER NOT NULL,
  "cash_remaining_currency" TEXT NOT NULL,
  "price_captured_at" TIMESTAMPTZ(3) NOT NULL,
  "hold_expires_at" TIMESTAMPTZ(3),
  "confirmed_at" TIMESTAMPTZ(3),
  "cancelled_at" TIMESTAMPTZ(3),
  "internal_notes" TEXT NOT NULL DEFAULT '',
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bookings_reference_key" UNIQUE ("reference"),
  CONSTRAINT "bookings_reference_check" CHECK (length(trim("reference")) > 0),
  CONSTRAINT "bookings_experience_snapshot_check" CHECK (
    length(trim("experience_id")) > 0
    AND length(trim("experience_name_snapshot")) > 0
  ),
  CONSTRAINT "bookings_calendar_block_id_check" CHECK (
    length(trim("calendar_block_id")) > 0
  ),
  CONSTRAINT "bookings_payment_record_id_check" CHECK (
    length(trim("payment_record_id")) > 0
  ),
  CONSTRAINT "bookings_guest_count_check" CHECK ("guest_count" > 0),
  CONSTRAINT "bookings_customer_check" CHECK (
    length(trim("customer_name")) > 0
    AND length(trim("customer_email")) > 0
    AND length(trim("customer_locale")) > 0
  ),
  CONSTRAINT "bookings_selected_range_check" CHECK (
    "selected_start_minutes" >= 0
    AND "selected_end_minutes" <= 1440
    AND "selected_end_minutes" > "selected_start_minutes"
  ),
  CONSTRAINT "bookings_timezone_check" CHECK (length(trim("timezone")) > 0),
  CONSTRAINT "bookings_amounts_check" CHECK (
    "total_amount_minor" >= 0
    AND "deposit_amount_minor" >= 0
    AND "cash_remaining_amount_minor" >= 0
    AND "cash_remaining_amount_minor" = "total_amount_minor" - "deposit_amount_minor"
  )
);

CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_experience_id_idx" ON "bookings"("experience_id");
CREATE INDEX "bookings_customer_email_idx" ON "bookings"("customer_email");
CREATE INDEX "bookings_selected_date_idx" ON "bookings"("selected_local_date");

CREATE TABLE "booking_extras" (
  "id" TEXT NOT NULL,
  "booking_id" TEXT NOT NULL,
  "extra_id" TEXT NOT NULL,
  "name_snapshot" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_amount_minor" INTEGER NOT NULL,
  "unit_currency" TEXT NOT NULL,
  "total_amount_minor" INTEGER NOT NULL,
  "total_currency" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "booking_extras_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "booking_extras_booking_id_extra_id_key" UNIQUE ("booking_id", "extra_id"),
  CONSTRAINT "booking_extras_name_check" CHECK (length(trim("name_snapshot")) > 0),
  CONSTRAINT "booking_extras_quantity_check" CHECK ("quantity" > 0),
  CONSTRAINT "booking_extras_amounts_check" CHECK (
    "unit_amount_minor" >= 0
    AND "total_amount_minor" = "unit_amount_minor" * "quantity"
  ),
  CONSTRAINT "booking_extras_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "booking_extras_booking_id_idx" ON "booking_extras"("booking_id");
CREATE INDEX "booking_extras_extra_id_idx" ON "booking_extras"("extra_id");

CREATE TABLE "payment_records" (
  "id" TEXT NOT NULL,
  "booking_id" TEXT NOT NULL,
  "status" "PaymentRecordStatus" NOT NULL,
  "amount_minor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_session_id" TEXT,
  "provider_payment_intent_id" TEXT,
  "failure_reason" TEXT,
  "paid_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_records_amount_check" CHECK ("amount_minor" >= 0),
  CONSTRAINT "payment_records_provider_check" CHECK (length(trim("provider")) > 0),
  CONSTRAINT "payment_records_booking_id_fkey"
    FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "payment_records_booking_id_idx" ON "payment_records"("booking_id");
CREATE INDEX "payment_records_status_idx" ON "payment_records"("status");
