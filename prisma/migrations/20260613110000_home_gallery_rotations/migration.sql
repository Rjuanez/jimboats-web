-- CreateEnum
CREATE TYPE "HomeGalleryLayout" AS ENUM ('BALANCED', 'LANDSCAPE_LED', 'PORTRAIT_LED');

-- CreateEnum
CREATE TYPE "HomeGalleryRotationTrigger" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "HomeGallerySlotOrientation" AS ENUM ('LANDSCAPE', 'PORTRAIT', 'SQUARE');

-- CreateTable
CREATE TABLE "home_gallery_compositions" (
    "id" TEXT NOT NULL,
    "layout" "HomeGalleryLayout" NOT NULL,
    "trigger" "HomeGalleryRotationTrigger" NOT NULL,
    "seed" TEXT NOT NULL,
    "published_at" TIMESTAMPTZ(3) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_gallery_compositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_gallery_composition_slots" (
    "id" TEXT NOT NULL,
    "composition_id" TEXT NOT NULL,
    "media_asset_id" TEXT NOT NULL,
    "slot_key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "orientation" "HomeGallerySlotOrientation" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_gallery_composition_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "home_gallery_compositions_published_at_idx" ON "home_gallery_compositions"("published_at");

-- CreateIndex
CREATE INDEX "home_gallery_compositions_expires_at_idx" ON "home_gallery_compositions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "home_gallery_slots_composition_id_position_key" ON "home_gallery_composition_slots"("composition_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "home_gallery_slots_composition_id_slot_key_key" ON "home_gallery_composition_slots"("composition_id", "slot_key");

-- CreateIndex
CREATE INDEX "home_gallery_slots_composition_id_idx" ON "home_gallery_composition_slots"("composition_id");

-- CreateIndex
CREATE INDEX "home_gallery_slots_media_asset_id_idx" ON "home_gallery_composition_slots"("media_asset_id");

-- AddForeignKey
ALTER TABLE "home_gallery_composition_slots" ADD CONSTRAINT "home_gallery_composition_slots_composition_id_fkey" FOREIGN KEY ("composition_id") REFERENCES "home_gallery_compositions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_gallery_composition_slots" ADD CONSTRAINT "home_gallery_composition_slots_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
