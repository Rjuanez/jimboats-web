import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import type { MediaStorage } from "@/modules/media-library/application/ports/MediaStorage";
import type { SaveMediaOriginalInput } from "@/modules/media-library/application/ports/MediaStorage";
import type {
  MediaAssetCollection,
  MediaAssetOriginal,
} from "@/modules/media-library/domain/MediaAsset";

export type LocalMediaStorageConfig = {
  mediaRoot: string;
};

export class LocalMediaStorage implements MediaStorage {
  constructor(private readonly config: LocalMediaStorageConfig) {}

  async saveOriginal(
    input: SaveMediaOriginalInput,
  ): Promise<MediaAssetOriginal> {
    const hash = createContentHash(input.contents);
    const metadata = await sharp(input.contents).metadata();
    const dimensions = {
      height: metadata.height ?? 0,
      width: metadata.width ?? 0,
    };
    const collectionFolder = collectionToFolder(input.collection);
    const originalDirectory = path.join(
      this.config.mediaRoot,
      "originals",
      collectionFolder,
    );
    const filename = buildPrivateFilename(input.assetId, hash, input.mimeType);
    const privatePath = path.join(originalDirectory, filename);

    await mkdir(originalDirectory, { recursive: true });
    await writeFile(privatePath, input.contents);

    return {
      dimensions,
      fileSizeBytes: input.contents.byteLength,
      filename: sanitizeFilename(input.filename),
      hash,
      mimeType: input.mimeType,
      privatePath,
    };
  }
}

export function createLocalMediaStorageFromEnv() {
  const mediaRoot = process.env.MEDIA_ROOT;

  if (!mediaRoot) {
    throw new Error("MEDIA_ROOT is required to initialize media storage.");
  }

  return new LocalMediaStorage({
    mediaRoot,
  });
}

function createContentHash(contents: Uint8Array) {
  return createHash("sha256").update(contents).digest("hex");
}

function buildPrivateFilename(
  assetId: string,
  hash: string,
  mimeType: SaveMediaOriginalInput["mimeType"],
) {
  return `${sanitizeFilename(assetId)}-${hash}.${extensionForMimeType(mimeType)}`;
}

function extensionForMimeType(mimeType: SaveMediaOriginalInput["mimeType"]) {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  return "webp";
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

  return safeBasename || "media-original";
}
