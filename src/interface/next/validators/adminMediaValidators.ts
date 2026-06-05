import { z } from "zod";

import type {
  RequestMediaReprocessCommand,
  UpdateMediaAssetMetadataCommand,
  UploadMediaAssetCommand,
} from "@/modules/media-library/application/AdminMediaDtos";
import type {
  MediaAssetCollection,
  MediaAssetMimeType,
} from "@/modules/media-library/domain/MediaAsset";

const maxUploadBytes = 12 * 1024 * 1024;

const mediaCollectionSchema = z.enum([
  "Experiences",
  "Extras",
  "Gallery",
  "Pages",
]);
const mediaMimeTypeSchema = z.enum(["image/jpeg", "image/png", "image/webp"]);
const altTextSchema = z.object({
  ca: z.string(),
  en: z.string(),
  es: z.string(),
});

export const adminMediaMetadataSchema = z.object({
  altText: altTextSchema,
  assetId: z.string().trim().min(1),
  collection: mediaCollectionSchema,
  title: z.string().trim().min(1),
});

export const adminMediaAssetIdSchema = z.object({
  assetId: z.string().trim().min(1),
});

export async function parseAdminMediaUploadFormData(
  input: FormData,
): Promise<UploadMediaAssetCommand> {
  const file = readUploadFile(input);
  const commandInput = z
    .object({
      altText: altTextSchema,
      collection: mediaCollectionSchema,
      title: z.string().trim().min(1),
    })
    .parse({
      altText: readAltText(input),
      collection: readText(input, "collection"),
      title: readText(input, "title"),
    });
  const contents = new Uint8Array(await file.arrayBuffer());

  if (contents.byteLength === 0) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Media file cannot be empty.",
        path: ["file"],
      },
    ]);
  }

  if (contents.byteLength > maxUploadBytes) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Media file must be 12 MB or smaller.",
        path: ["file"],
      },
    ]);
  }

  return {
    altText: normalizeAltText(commandInput.altText),
    collection: collectionToApplication(commandInput.collection),
    file: {
      contents,
      filename: file.name,
      mimeType: mediaMimeTypeSchema.parse(file.type),
    },
    title: commandInput.title,
  };
}

export function parseAdminMediaMetadata(
  input: unknown,
): UpdateMediaAssetMetadataCommand {
  const commandInput = adminMediaMetadataSchema.parse(input);

  return {
    altText: normalizeAltText(commandInput.altText),
    assetId: commandInput.assetId,
    collection: collectionToApplication(commandInput.collection),
    title: commandInput.title,
  };
}

export function parseAdminMediaAssetId(
  input: unknown,
): RequestMediaReprocessCommand {
  return adminMediaAssetIdSchema.parse(input);
}

function readUploadFile(input: FormData) {
  const file = input.get("file");

  if (!(file instanceof File)) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Media file is required.",
        path: ["file"],
      },
    ]);
  }

  mediaMimeTypeSchema.parse(file.type);

  return file;
}

function readAltText(input: FormData) {
  return {
    ca: readText(input, "altText.ca"),
    en: readText(input, "altText.en"),
    es: readText(input, "altText.es"),
  };
}

function readText(input: FormData, key: string) {
  const value = input.get(key);

  return typeof value === "string" ? value : "";
}

function normalizeAltText(altText: Record<"ca" | "en" | "es", string>) {
  return {
    ca: altText.ca.trim(),
    en: altText.en.trim(),
    es: altText.es.trim(),
  };
}

function collectionToApplication(
  collection: z.infer<typeof mediaCollectionSchema>,
): MediaAssetCollection {
  const collections = {
    Experiences: "EXPERIENCES",
    Extras: "EXTRAS",
    Gallery: "GALLERY",
    Pages: "PAGES",
  } satisfies Record<
    z.infer<typeof mediaCollectionSchema>,
    MediaAssetCollection
  >;

  return collections[collection];
}

export function mimeTypeToApplication(value: string): MediaAssetMimeType {
  return mediaMimeTypeSchema.parse(value);
}
