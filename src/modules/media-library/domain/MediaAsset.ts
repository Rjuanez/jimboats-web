import { domainError } from "@/shared/domain/DomainError";
import type { SupportedLocaleCode } from "@/shared/domain/LocaleCode";

export type MediaAssetCollection =
  | "EXPERIENCES"
  | "EXTRAS"
  | "GALLERY"
  | "PAGES";
export type MediaAssetFormat = "jpeg" | "png" | "webp";
export type MediaAssetMimeType = "image/jpeg" | "image/png" | "image/webp";
export type MediaAssetStatus = "FAILED" | "PROCESSING" | "READY";

export type MediaDimensions = {
  height: number;
  width: number;
};

export type MediaAssetOriginal = {
  dimensions: MediaDimensions;
  fileSizeBytes: number;
  filename: string;
  hash: string;
  mimeType: MediaAssetMimeType;
  privatePath: string;
};

export type MediaAssetVariant = {
  dimensions: MediaDimensions;
  fileSizeBytes: number;
  format: MediaAssetFormat;
  hash: string;
  id: string;
  publicPath: string;
};

export type MediaAssetAltText = Partial<Record<SupportedLocaleCode, string>>;

export type MediaAssetProps = {
  altText: MediaAssetAltText;
  collection: MediaAssetCollection;
  createdAt: Date;
  failureReason: string | null;
  id: string;
  original: MediaAssetOriginal;
  status: MediaAssetStatus;
  title: string;
  updatedAt: Date;
  variants: MediaAssetVariant[];
};

export type MediaAssetVariantSnapshot = MediaAssetVariant;

export type MediaAssetSnapshot = {
  altText: MediaAssetAltText;
  collection: MediaAssetCollection;
  createdAt: string;
  failureReason: string | null;
  id: string;
  original: MediaAssetOriginal;
  status: MediaAssetStatus;
  title: string;
  updatedAt: string;
  variants: MediaAssetVariantSnapshot[];
};

const supportedCollections = new Set<MediaAssetCollection>([
  "EXPERIENCES",
  "EXTRAS",
  "GALLERY",
  "PAGES",
]);

const supportedMimeTypes = new Set<MediaAssetMimeType>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const supportedFormats = new Set<MediaAssetFormat>(["jpeg", "png", "webp"]);

export class MediaAsset {
  private constructor(private readonly props: MediaAssetProps) {}

  static create(input: MediaAssetProps) {
    const id = input.id.trim();
    const title = normalizeText(input.title);
    const original = validateOriginal(input.original);
    const variants = input.variants.map(validateVariant);
    const failureReason = input.failureReason
      ? normalizeText(input.failureReason)
      : null;

    if (!id) {
      throw domainError("MEDIA_ASSET_ID_MISSING", "Media asset id is required.");
    }

    if (!title) {
      throw domainError(
        "MEDIA_ASSET_TITLE_MISSING",
        "Media asset title is required.",
      );
    }

    if (!supportedCollections.has(input.collection)) {
      throw domainError(
        "MEDIA_ASSET_COLLECTION_INVALID",
        "Media asset collection is not supported.",
      );
    }

    if (input.status === "READY" && variants.length === 0) {
      throw domainError(
        "MEDIA_ASSET_VARIANTS_MISSING",
        "A ready media asset requires at least one public variant.",
      );
    }

    return new MediaAsset({
      ...input,
      altText: normalizeAltText(input.altText),
      failureReason,
      id,
      original,
      title,
      variants,
    });
  }

  static processing(
    input: Pick<
      MediaAssetProps,
      "altText" | "collection" | "createdAt" | "id" | "original" | "title"
    >,
  ) {
    return MediaAsset.create({
      ...input,
      failureReason: null,
      status: "PROCESSING",
      updatedAt: input.createdAt,
      variants: [],
    });
  }

  get id() {
    return this.props.id;
  }

  get status() {
    return this.props.status;
  }

  markProcessing(updatedAt: Date) {
    return MediaAsset.create({
      ...this.props,
      failureReason: null,
      status: "PROCESSING",
      updatedAt,
    });
  }

  markReady(variants: MediaAssetVariant[], updatedAt: Date) {
    return MediaAsset.create({
      ...this.props,
      failureReason: null,
      status: "READY",
      updatedAt,
      variants,
    });
  }

  markFailed(reason: string, updatedAt: Date) {
    return MediaAsset.create({
      ...this.props,
      failureReason: normalizeText(reason) || "Media processing failed.",
      status: "FAILED",
      updatedAt,
    });
  }

  withMetadata(
    patch: Partial<Pick<MediaAssetProps, "altText" | "collection" | "title">>,
    updatedAt: Date,
  ) {
    const nextProps: MediaAssetProps = {
      ...this.props,
      updatedAt,
    };

    if (patch.altText !== undefined) {
      nextProps.altText = patch.altText;
    }

    if (patch.collection !== undefined) {
      nextProps.collection = patch.collection;
    }

    if (patch.title !== undefined) {
      nextProps.title = patch.title;
    }

    return MediaAsset.create(nextProps);
  }

  getMissingAltLocales(locales: SupportedLocaleCode[]) {
    return locales.filter((locale) => !this.props.altText[locale]?.trim());
  }

  toSnapshot(): MediaAssetSnapshot {
    return {
      altText: { ...this.props.altText },
      collection: this.props.collection,
      createdAt: this.props.createdAt.toISOString(),
      failureReason: this.props.failureReason,
      id: this.props.id,
      original: {
        ...this.props.original,
        dimensions: { ...this.props.original.dimensions },
      },
      status: this.props.status,
      title: this.props.title,
      updatedAt: this.props.updatedAt.toISOString(),
      variants: this.props.variants.map((variant) => ({
        ...variant,
        dimensions: { ...variant.dimensions },
      })),
    };
  }
}

function validateOriginal(original: MediaAssetOriginal): MediaAssetOriginal {
  const filename = original.filename.trim();
  const privatePath = original.privatePath.trim();
  const hash = original.hash.trim();

  if (!supportedMimeTypes.has(original.mimeType)) {
    throw domainError(
      "MEDIA_ASSET_MIME_TYPE_UNSUPPORTED",
      "Media asset mime type is not supported.",
    );
  }

  if (!filename || !privatePath || privatePath.startsWith("/media/")) {
    throw domainError(
      "MEDIA_ASSET_ORIGINAL_PATH_INVALID",
      "Media original must use a private path.",
    );
  }

  if (!hash) {
    throw domainError(
      "MEDIA_ASSET_HASH_MISSING",
      "Media asset hash is required.",
    );
  }

  assertDimensions(original.dimensions);
  assertFileSize(original.fileSizeBytes);

  return {
    ...original,
    filename,
    hash,
    privatePath,
  };
}

function validateVariant(variant: MediaAssetVariant): MediaAssetVariant {
  const id = variant.id.trim();
  const publicPath = variant.publicPath.trim();
  const hash = variant.hash.trim();

  if (
    !id ||
    !publicPath.startsWith("/media/") ||
    !hash ||
    !supportedFormats.has(variant.format)
  ) {
    throw domainError(
      "MEDIA_ASSET_VARIANT_INVALID",
      "Media variant metadata is invalid.",
    );
  }

  assertDimensions(variant.dimensions);
  assertFileSize(variant.fileSizeBytes);

  return {
    ...variant,
    hash,
    id,
    publicPath,
  };
}

function assertDimensions(dimensions: MediaDimensions) {
  if (
    !Number.isInteger(dimensions.height) ||
    !Number.isInteger(dimensions.width) ||
    dimensions.height <= 0 ||
    dimensions.width <= 0
  ) {
    throw domainError(
      "MEDIA_ASSET_DIMENSIONS_INVALID",
      "Media dimensions must be positive integers.",
    );
  }
}

function assertFileSize(fileSizeBytes: number) {
  if (!Number.isInteger(fileSizeBytes) || fileSizeBytes <= 0) {
    throw domainError(
      "MEDIA_ASSET_FILE_SIZE_INVALID",
      "Media file size must be a positive integer.",
    );
  }
}

function normalizeAltText(altText: MediaAssetAltText): MediaAssetAltText {
  return Object.fromEntries(
    Object.entries(altText).map(([locale, value]) => [
      locale,
      normalizeText(value ?? ""),
    ]),
  ) as MediaAssetAltText;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
