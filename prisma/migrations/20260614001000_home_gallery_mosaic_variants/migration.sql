-- CreateEnum
CREATE TYPE "HomeGalleryMosaicVariant" AS ENUM (
    'BALANCED_CLASSIC',
    'BALANCED_RHYTHM',
    'BALANCED_STACK',
    'LANDSCAPE_HERO_LEFT',
    'LANDSCAPE_PANORAMA_TOP',
    'LANDSCAPE_WIDE_DUO',
    'PORTRAIT_COLUMNS',
    'PORTRAIT_EDITORIAL',
    'PORTRAIT_FEATURE_PAIR'
);

-- AlterTable
ALTER TABLE "home_gallery_compositions"
ADD COLUMN "mosaic_variant" "HomeGalleryMosaicVariant";

UPDATE "home_gallery_compositions"
SET "mosaic_variant" = CASE "layout"
    WHEN 'LANDSCAPE_LED' THEN 'LANDSCAPE_HERO_LEFT'::"HomeGalleryMosaicVariant"
    WHEN 'PORTRAIT_LED' THEN 'PORTRAIT_COLUMNS'::"HomeGalleryMosaicVariant"
    ELSE 'BALANCED_CLASSIC'::"HomeGalleryMosaicVariant"
END;

ALTER TABLE "home_gallery_compositions"
ALTER COLUMN "mosaic_variant" SET NOT NULL,
ALTER COLUMN "mosaic_variant" SET DEFAULT 'BALANCED_CLASSIC';
