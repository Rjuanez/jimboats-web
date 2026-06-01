CREATE TYPE "ExperienceStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ExperienceMediaStatus" AS ENUM ('MISSING', 'PROCESSING', 'READY', 'FAILED');
CREATE TYPE "SlotPolicyMode" AS ENUM ('FIXED_SLOTS', 'ANY_AVAILABLE', 'MANUAL_APPROVAL');
CREATE TYPE "ExtraStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "LocalizedContentStatus" AS ENUM (
  'DRAFT',
  'NEEDS_TRANSLATION',
  'NEEDS_REVIEW',
  'OUTDATED',
  'READY',
  'PUBLISHED',
  'ARCHIVED'
);
CREATE TYPE "IndexingPolicy" AS ENUM ('INDEX', 'NOINDEX');

CREATE TABLE "experiences" (
  "id" TEXT NOT NULL,
  "internal_name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" "ExperienceStatus" NOT NULL,
  "base_price_amount_minor" INTEGER NOT NULL,
  "base_price_currency" TEXT NOT NULL,
  "deposit_amount_minor" INTEGER NOT NULL,
  "deposit_currency" TEXT NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "capacity" INTEGER NOT NULL,
  "included_items" TEXT NOT NULL,
  "primary_media_asset_id" TEXT,
  "primary_media_status" "ExperienceMediaStatus" NOT NULL DEFAULT 'MISSING',
  "slot_policy_mode" "SlotPolicyMode" NOT NULL,
  "slot_policy_timezone" TEXT NOT NULL,
  "slot_operating_start_minutes" INTEGER,
  "slot_operating_end_minutes" INTEGER,
  "slot_granularity_minutes" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "experiences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "experiences_base_price_amount_minor_check" CHECK ("base_price_amount_minor" >= 0),
  CONSTRAINT "experiences_deposit_amount_minor_check" CHECK ("deposit_amount_minor" >= 0),
  CONSTRAINT "experiences_duration_minutes_check" CHECK ("duration_minutes" > 0),
  CONSTRAINT "experiences_capacity_check" CHECK ("capacity" > 0)
);

CREATE TABLE "experience_fixed_slots" (
  "id" TEXT NOT NULL,
  "experience_id" TEXT NOT NULL,
  "slot_key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL,
  "start_minutes" INTEGER NOT NULL,
  "end_minutes" INTEGER NOT NULL,
  "position" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "experience_fixed_slots_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "experience_fixed_slots_start_minutes_check" CHECK ("start_minutes" >= 0),
  CONSTRAINT "experience_fixed_slots_end_minutes_check" CHECK ("end_minutes" <= 1440),
  CONSTRAINT "experience_fixed_slots_range_check" CHECK ("end_minutes" > "start_minutes")
);

CREATE TABLE "extras" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "ExtraStatus" NOT NULL,
  "price_amount_minor" INTEGER NOT NULL,
  "price_currency" TEXT NOT NULL,
  "default_notice_minutes" INTEGER NOT NULL,
  "primary_media_asset_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "extras_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "extras_price_amount_minor_check" CHECK ("price_amount_minor" >= 0),
  CONSTRAINT "extras_default_notice_minutes_check" CHECK ("default_notice_minutes" >= 0)
);

CREATE TABLE "experience_extra_rules" (
  "id" TEXT NOT NULL,
  "experience_id" TEXT NOT NULL,
  "extra_id" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL,
  "limit_per_booking" INTEGER NOT NULL,
  "notice_minutes" INTEGER NOT NULL,
  "price_override_amount_minor" INTEGER,
  "price_override_currency" TEXT,
  "capacity_reduction" INTEGER NOT NULL,
  "slot_key" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "experience_extra_rules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "experience_extra_rules_limit_per_booking_check" CHECK ("limit_per_booking" >= 0),
  CONSTRAINT "experience_extra_rules_notice_minutes_check" CHECK ("notice_minutes" >= 0),
  CONSTRAINT "experience_extra_rules_price_override_amount_minor_check" CHECK ("price_override_amount_minor" IS NULL OR "price_override_amount_minor" >= 0),
  CONSTRAINT "experience_extra_rules_capacity_reduction_check" CHECK ("capacity_reduction" >= 0),
  CONSTRAINT "experience_extra_rules_price_override_pair_check" CHECK (
    ("price_override_amount_minor" IS NULL AND "price_override_currency" IS NULL)
    OR ("price_override_amount_minor" IS NOT NULL AND "price_override_currency" IS NOT NULL)
  )
);

CREATE TABLE "localized_experience_contents" (
  "id" TEXT NOT NULL,
  "experience_id" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "LocalizedContentStatus" NOT NULL,
  "public_page_enabled" BOOLEAN NOT NULL,
  "indexing_policy" "IndexingPolicy" NOT NULL,
  "title" TEXT NOT NULL,
  "h1" TEXT NOT NULL,
  "main_content" TEXT NOT NULL,
  "seo_title" TEXT NOT NULL,
  "seo_description" TEXT NOT NULL,
  "geo_summary" TEXT NOT NULL,
  "source_version" INTEGER NOT NULL DEFAULT 1,
  "published_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "localized_experience_contents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "localized_experience_contents_source_version_check" CHECK ("source_version" > 0)
);

CREATE TABLE "localized_experience_faqs" (
  "id" TEXT NOT NULL,
  "localized_content_id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "localized_experience_faqs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "experiences_status_idx" ON "experiences"("status");
CREATE INDEX "experiences_primary_media_asset_id_idx" ON "experiences"("primary_media_asset_id");

CREATE UNIQUE INDEX "experience_fixed_slots_experience_id_slot_key_key"
  ON "experience_fixed_slots"("experience_id", "slot_key");
CREATE INDEX "experience_fixed_slots_experience_id_idx" ON "experience_fixed_slots"("experience_id");

CREATE INDEX "extras_status_idx" ON "extras"("status");
CREATE INDEX "extras_primary_media_asset_id_idx" ON "extras"("primary_media_asset_id");

CREATE UNIQUE INDEX "experience_extra_rules_experience_id_extra_id_slot_key_key"
  ON "experience_extra_rules"("experience_id", "extra_id", "slot_key");
CREATE INDEX "experience_extra_rules_experience_id_idx" ON "experience_extra_rules"("experience_id");
CREATE INDEX "experience_extra_rules_extra_id_idx" ON "experience_extra_rules"("extra_id");
CREATE INDEX "experience_extra_rules_slot_key_idx" ON "experience_extra_rules"("slot_key");

CREATE UNIQUE INDEX "localized_experience_contents_experience_id_locale_key"
  ON "localized_experience_contents"("experience_id", "locale");
CREATE UNIQUE INDEX "localized_experience_contents_locale_slug_key"
  ON "localized_experience_contents"("locale", "slug");
CREATE INDEX "localized_experience_contents_experience_id_idx"
  ON "localized_experience_contents"("experience_id");
CREATE INDEX "localized_experience_contents_locale_status_idx"
  ON "localized_experience_contents"("locale", "status");
CREATE INDEX "localized_experience_contents_slug_idx"
  ON "localized_experience_contents"("locale", "slug");

CREATE UNIQUE INDEX "localized_experience_faqs_content_id_position_key"
  ON "localized_experience_faqs"("localized_content_id", "position");
CREATE INDEX "localized_experience_faqs_content_id_idx"
  ON "localized_experience_faqs"("localized_content_id");

ALTER TABLE "experience_fixed_slots"
  ADD CONSTRAINT "experience_fixed_slots_experience_id_fkey"
  FOREIGN KEY ("experience_id") REFERENCES "experiences"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_extra_rules"
  ADD CONSTRAINT "experience_extra_rules_experience_id_fkey"
  FOREIGN KEY ("experience_id") REFERENCES "experiences"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "experience_extra_rules"
  ADD CONSTRAINT "experience_extra_rules_extra_id_fkey"
  FOREIGN KEY ("extra_id") REFERENCES "extras"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "localized_experience_contents"
  ADD CONSTRAINT "localized_experience_contents_experience_id_fkey"
  FOREIGN KEY ("experience_id") REFERENCES "experiences"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "localized_experience_faqs"
  ADD CONSTRAINT "localized_experience_faqs_content_id_fkey"
  FOREIGN KEY ("localized_content_id") REFERENCES "localized_experience_contents"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
