import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SharpLocalMediaVariantGenerator } from "./SharpLocalMediaVariantGenerator";

describe("SharpLocalMediaVariantGenerator", () => {
  let tempDirectory: string;

  beforeEach(async () => {
    tempDirectory = await mkdtemp(path.join(os.tmpdir(), "jimboats-media-"));
  });

  afterEach(async () => {
    await rm(tempDirectory, {
      force: true,
      recursive: true,
    });
  });

  it("generates immutable WebP variants under the public media directory", async () => {
    const originalPath = path.join(tempDirectory, "original.png");
    const original = await sharp({
      create: {
        background: "#0f172a",
        channels: 4,
        height: 900,
        width: 1600,
      },
    })
      .png()
      .toBuffer();

    await sharp(original).toFile(originalPath);

    const generator = new SharpLocalMediaVariantGenerator({
      mediaRoot: tempDirectory,
      publicBaseUrl: "/media",
    });

    const variants = await generator.generateVariants({
      assetId: "asset-sunset",
      collection: "EXPERIENCES",
      original: {
        dimensions: {
          height: 900,
          width: 1600,
        },
        fileSizeBytes: original.byteLength,
        filename: "sunset.png",
        hash: "original-hash",
        mimeType: "image/png",
        privatePath: originalPath,
      },
    });

    expect(variants.map((variant) => variant.id)).toEqual([
      "640w",
      "1280w",
      "1600w",
    ]);

    for (const variant of variants) {
      expect(variant.format).toBe("webp");
      expect(variant.hash).toHaveLength(64);
      expect(variant.publicPath).toMatch(
        /^\/media\/experiences\/asset-sunset-[a-f0-9]{16}-\d+\.webp$/,
      );

      const publicFilePath = path.join(
        tempDirectory,
        "public",
        variant.publicPath.replace("/media/", ""),
      );
      const publicFile = await readFile(publicFilePath);
      const metadata = await sharp(publicFile).metadata();

      expect(publicFile.byteLength).toBe(variant.fileSizeBytes);
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBe(variant.dimensions.width);
    }
  });
});
