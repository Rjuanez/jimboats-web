import type { AdminNavItem } from "@/components/layout/AdminNavigation";

export type AdminMediaLocaleCode = "ca" | "en" | "es";
export type AdminMediaCollection =
  | "Experiences"
  | "Extras"
  | "Gallery"
  | "Pages";
export type AdminMediaStatus = "failed" | "processing" | "ready";
export type AdminMediaUsageType = "experience" | "extra" | "gallery" | "page";

export type AdminMediaVariant = {
  dimensions: string;
  format: string;
  id: string;
  publicUrl: string;
  sizeLabel: string;
  status: AdminMediaStatus;
  width: number;
};

export type AdminMediaUsage = {
  href: string;
  id: string;
  label: string;
  type: AdminMediaUsageType;
};

export type AdminMediaProcessingEvent = {
  at: string;
  label: string;
  status: AdminMediaStatus;
};

export type AdminMediaAsset = {
  altText: Record<AdminMediaLocaleCode, string>;
  absolutePublicUrl: string;
  collection: AdminMediaCollection;
  dimensions: string;
  failureReason: string | null;
  filename: string;
  format: string;
  hash: string;
  id: string;
  originalPath: string;
  publicPath: string;
  publicUrl: string;
  sizeLabel: string;
  status: AdminMediaStatus;
  title: string;
  updatedAt: string;
  usage: AdminMediaUsage[];
  variants: AdminMediaVariant[];
  workflow: AdminMediaProcessingEvent[];
};

export type AdminMediaPageData = {
  assets: AdminMediaAsset[];
  navItems: AdminNavItem[];
};

export type AdminMediaActionResult<TData = undefined> =
  | {
      data: TData;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type AdminMediaMetadataInput = {
  altText: Record<AdminMediaLocaleCode, string>;
  assetId: string;
  collection: AdminMediaCollection;
  title: string;
};

export type AdminMediaActions = {
  rotateHomeGallery?: () => Promise<
    AdminMediaActionResult<{
      state: AdminMediaPageData;
    }>
  >;
  requestReprocess: (input: { assetId: string }) => Promise<
    AdminMediaActionResult<{
      state: AdminMediaPageData;
    }>
  >;
  updateMetadata: (input: AdminMediaMetadataInput) => Promise<
    AdminMediaActionResult<{
      state: AdminMediaPageData;
    }>
  >;
  uploadAsset: (input: FormData) => Promise<
    AdminMediaActionResult<{
      assetId: string;
      state: AdminMediaPageData;
    }>
  >;
};
