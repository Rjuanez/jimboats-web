CREATE TYPE "MediaAssetStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');
CREATE TYPE "MediaAssetCollection" AS ENUM ('EXPERIENCES', 'EXTRAS', 'GALLERY', 'PAGES');
CREATE TYPE "MediaProcessingJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

CREATE TABLE "media_assets" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "collection" "MediaAssetCollection" NOT NULL,
  "status" "MediaAssetStatus" NOT NULL,
  "original_private_path" TEXT NOT NULL,
  "original_filename" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "original_width" INTEGER NOT NULL,
  "original_height" INTEGER NOT NULL,
  "original_size_bytes" INTEGER NOT NULL,
  "original_content_hash" TEXT NOT NULL,
  "failure_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "media_assets_title_check" CHECK (length(trim("title")) > 0),
  CONSTRAINT "media_assets_original_private_path_check" CHECK (
    length(trim("original_private_path")) > 0
    AND "original_private_path" NOT LIKE '/media/%'
  ),
  CONSTRAINT "media_assets_original_filename_check" CHECK (length(trim("original_filename")) > 0),
  CONSTRAINT "media_assets_mime_type_check" CHECK (length(trim("mime_type")) > 0),
  CONSTRAINT "media_assets_original_dimensions_check" CHECK (
    "original_width" > 0 AND "original_height" > 0
  ),
  CONSTRAINT "media_assets_original_size_bytes_check" CHECK ("original_size_bytes" > 0),
  CONSTRAINT "media_assets_original_content_hash_check" CHECK (length(trim("original_content_hash")) > 0)
);

CREATE TABLE "media_asset_variants" (
  "id" TEXT NOT NULL,
  "media_asset_id" TEXT NOT NULL,
  "variant_key" TEXT NOT NULL,
  "public_path" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "content_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "media_asset_variants_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "media_asset_variants_variant_key_check" CHECK (length(trim("variant_key")) > 0),
  CONSTRAINT "media_asset_variants_public_path_check" CHECK (
    length(trim("public_path")) > 0
    AND "public_path" LIKE '/media/%'
  ),
  CONSTRAINT "media_asset_variants_format_check" CHECK (length(trim("format")) > 0),
  CONSTRAINT "media_asset_variants_dimensions_check" CHECK ("width" > 0 AND "height" > 0),
  CONSTRAINT "media_asset_variants_size_bytes_check" CHECK ("size_bytes" > 0),
  CONSTRAINT "media_asset_variants_content_hash_check" CHECK (length(trim("content_hash")) > 0)
);

CREATE TABLE "media_alt_texts" (
  "id" TEXT NOT NULL,
  "media_asset_id" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "alt_text" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "media_alt_texts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "media_alt_texts_locale_check" CHECK ("locale" IN ('en', 'es', 'ca'))
);

CREATE TABLE "media_processing_jobs" (
  "id" TEXT NOT NULL,
  "media_asset_id" TEXT NOT NULL,
  "status" "MediaProcessingJobStatus" NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "last_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "media_processing_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "media_processing_jobs_attempts_check" CHECK ("attempts" >= 0)
);

CREATE INDEX "media_assets_status_idx" ON "media_assets"("status");
CREATE INDEX "media_assets_collection_idx" ON "media_assets"("collection");
CREATE INDEX "media_assets_original_content_hash_idx" ON "media_assets"("original_content_hash");
CREATE INDEX "media_assets_updated_at_idx" ON "media_assets"("updated_at");

CREATE UNIQUE INDEX "media_asset_variants_asset_id_variant_key_key"
  ON "media_asset_variants"("media_asset_id", "variant_key");
CREATE UNIQUE INDEX "media_asset_variants_public_path_key"
  ON "media_asset_variants"("public_path");
CREATE INDEX "media_asset_variants_media_asset_id_idx"
  ON "media_asset_variants"("media_asset_id");

CREATE UNIQUE INDEX "media_alt_texts_media_asset_id_locale_key"
  ON "media_alt_texts"("media_asset_id", "locale");
CREATE INDEX "media_alt_texts_media_asset_id_idx"
  ON "media_alt_texts"("media_asset_id");

CREATE INDEX "media_processing_jobs_pick_idx"
  ON "media_processing_jobs"("status", "created_at");
CREATE INDEX "media_processing_jobs_media_asset_id_idx"
  ON "media_processing_jobs"("media_asset_id");

ALTER TABLE "media_asset_variants"
  ADD CONSTRAINT "media_asset_variants_media_asset_id_fkey"
  FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "media_alt_texts"
  ADD CONSTRAINT "media_alt_texts_media_asset_id_fkey"
  FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "media_processing_jobs"
  ADD CONSTRAINT "media_processing_jobs_media_asset_id_fkey"
  FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
