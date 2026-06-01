ALTER TABLE "experiences"
  ADD COLUMN "display_order" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "departure_port" TEXT NOT NULL DEFAULT 'Port Olimpic, Barcelona',
  ADD COLUMN "internal_notes" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "buffer_minutes" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "minimum_advance_minutes" INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN "maximum_advance_months" INTEGER NOT NULL DEFAULT 6,
  ADD COLUMN "allows_manual_scheduling" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "experiences"
  ADD CONSTRAINT "experiences_display_order_check" CHECK ("display_order" > 0),
  ADD CONSTRAINT "experiences_buffer_minutes_check" CHECK ("buffer_minutes" >= 0),
  ADD CONSTRAINT "experiences_minimum_advance_minutes_check" CHECK ("minimum_advance_minutes" >= 0),
  ADD CONSTRAINT "experiences_maximum_advance_months_check" CHECK (
    "maximum_advance_months" >= 1 AND "maximum_advance_months" <= 6
  );

CREATE INDEX "experiences_display_order_idx" ON "experiences"("display_order");

ALTER TABLE "localized_experience_contents"
  ADD COLUMN "summary" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "included_text" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "bring_text" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "visible_terms" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "key_facts" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "image_alt_text" TEXT NOT NULL DEFAULT '';
