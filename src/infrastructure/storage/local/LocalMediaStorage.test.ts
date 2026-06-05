import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LocalMediaStorage } from "./LocalMediaStorage";

describe("LocalMediaStorage", () => {
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

  it("stores uploaded originals in a private media directory", async () => {
    const storage = new LocalMediaStorage({
      mediaRoot: tempDirectory,
    });
    const contents = await sharp({
      create: {
        background: "#0f172a",
        channels: 4,
        height: 16,
        width: 24,
      },
    })
      .png()
      .toBuffer();

    const original = await storage.saveOriginal({
      assetId: "asset-sunset",
      collection: "EXPERIENCES",
      contents,
      filename: "../Sunset Hero.png",
      mimeType: "image/png",
    });

    expect(original).toMatchObject({
      dimensions: {
        height: 16,
        width: 24,
      },
      fileSizeBytes: contents.byteLength,
      filename: "Sunset-Hero.png",
      mimeType: "image/png",
    });
    expect(original.hash).toHaveLength(64);
    expect(original.privatePath).toContain(
      path.join(tempDirectory, "originals", "experiences"),
    );
    expect(original.privatePath).not.toContain("/media/");
    await expect(readFile(original.privatePath)).resolves.toEqual(contents);
  });
});
