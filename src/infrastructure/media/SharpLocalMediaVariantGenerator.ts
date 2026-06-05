import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import type { MediaVariantGenerator } from "@/modules/media-library/application/ports/MediaVariantGenerator";
import type { GenerateMediaVariantsInput } from "@/modules/media-library/application/ports/MediaVariantGenerator";
import type {
  MediaAssetCollection,
  MediaAssetVariant,
} from "@/modules/media-library/domain/MediaAsset";

export type SharpLocalMediaVariantGeneratorConfig = {
  mediaRoot: string;
  publicBaseUrl: string;
  widths?: number[];
};

const defaultVariantWidths = [640, 1280, 1920];

export class SharpLocalMediaVariantGenerator implements MediaVariantGenerator {
  constructor(private readonly config: SharpLocalMediaVariantGeneratorConfig) {}

  async generateVariants(
    input: GenerateMediaVariantsInput,
  ): Promise<MediaAssetVariant[]> {
    const imageMetadata = await sharp(input.original.privatePath).metadata();
    const originalWidth =
      imageMetadata.width ?? input.original.dimensions.width;
    const targetWidths = selectTargetWidths(
      originalWidth,
      this.config.widths ?? defaultVariantWidths,
    );
    const outputDirectory = path.join(
      this.config.mediaRoot,
      "public",
      collectionToFolder(input.collection),
    );

    await mkdir(outputDirectory, {
      recursive: true,
    });

    const variants: MediaAssetVariant[] = [];

    for (const width of targetWidths) {
      const buffer = await sharp(input.original.privatePath)
        .rotate()
        .resize({
          fit: "inside",
          width,
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
        })
        .toBuffer();
      const metadata = await sharp(buffer).metadata();
      const contentHash = createContentHash(buffer);
      const filename = buildPublicFilename(input.assetId, contentHash, width);
      const publicPath = buildPublicPath(
        this.config.publicBaseUrl,
        input.collection,
        filename,
      );

      await writeFile(path.join(outputDirectory, filename), buffer);

      variants.push({
        dimensions: {
          height: metadata.height ?? input.original.dimensions.height,
          width: metadata.width ?? width,
        },
        fileSizeBytes: buffer.byteLength,
        format: "webp",
        hash: contentHash,
        id: `${metadata.width ?? width}w`,
        publicPath,
      });
    }

    return variants;
  }
}

export function createSharpLocalMediaVariantGeneratorFromEnv() {
  const mediaRoot = process.env.MEDIA_ROOT;
  const publicBaseUrl = process.env.MEDIA_PUBLIC_BASE_URL ?? "/media";

  if (!mediaRoot) {
    throw new Error("MEDIA_ROOT is required to initialize media variants.");
  }

  return new SharpLocalMediaVariantGenerator({
    mediaRoot,
    publicBaseUrl,
  });
}

function selectTargetWidths(originalWidth: number, widths: number[]) {
  const validOriginalWidth =
    Number.isInteger(originalWidth) && originalWidth > 0
      ? originalWidth
      : widths[0];
  const selectedWidths = widths.filter((width) => width < validOriginalWidth);

  selectedWidths.push(validOriginalWidth);

  return [...new Set(selectedWidths)].sort((left, right) => left - right);
}

function buildPublicFilename(assetId: string, hash: string, width: number) {
  return `${sanitizeFilename(assetId)}-${hash.slice(0, 16)}-${width}.webp`;
}

function buildPublicPath(
  publicBaseUrl: string,
  collection: MediaAssetCollection,
  filename: string,
) {
  const normalizedBaseUrl = normalizePublicBaseUrl(publicBaseUrl);

  return `${normalizedBaseUrl}/${collectionToFolder(collection)}/${filename}`;
}

function normalizePublicBaseUrl(publicBaseUrl: string) {
  const normalizedBaseUrl =
    publicBaseUrl.trim().replace(/\/+$/g, "") || "/media";

  if (!normalizedBaseUrl.startsWith("/media")) {
    throw new Error("MEDIA_PUBLIC_BASE_URL must start with /media.");
  }

  return normalizedBaseUrl;
}

function createContentHash(contents: Uint8Array) {
  return createHash("sha256").update(contents).digest("hex");
}

function collectionToFolder(collection: MediaAssetCollection) {
  return collection.toLowerCase();
}

function sanitizeFilename(filename: string) {
  const basename = path.basename(filename).trim();
  const safeBasename = basename
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeBasename || "media-asset";
}
