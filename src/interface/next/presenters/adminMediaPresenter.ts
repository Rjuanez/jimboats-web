import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminMediaAsset,
  AdminMediaPageData,
} from "@/components/sections/admin-media/AdminMediaTypes";
import type {
  AdminMediaAssetDto,
  AdminMediaListDto,
} from "@/modules/media-library/application/AdminMediaDtos";
import type { AdminExperiencesWorkspaceDto } from "@/modules/experience-catalog/application/AdminExperienceDtos";
import type { AdminExtrasWorkspaceDto } from "@/modules/experience-catalog/application/AdminExtraDtos";

const mediaAssets: AdminMediaAsset[] = [
  {
    altText: {
      ca: "Catamara privat navegant al capvespre davant Barcelona.",
      en: "Private catamaran sailing at sunset in Barcelona.",
      es: "Catamaran privado navegando al atardecer frente a Barcelona.",
    },
    absolutePublicUrl:
      "http://localhost:3000/images/generated/landing/experience-sunset-toast-1024.webp",
    collection: "Experiences",
    dimensions: "1024 x 1024",
    failureReason: null,
    filename: "experience-sunset-toast.webp",
    format: "WebP",
    hash: "a8f4c2",
    id: "sunset-experience-hero",
    originalPath: "/var/lib/jimboats/media/originals/experiences/sunset.jpg",
    publicPath: "/media/experiences/sunset-experience-a8f4c2-1024.webp",
    publicUrl: "/images/generated/landing/experience-sunset-toast-1024.webp",
    sizeLabel: "186 KB",
    status: "ready",
    title: "Sunset Experience hero",
    updatedAt: "May 31, 2026, 18:20",
    usage: [
      {
        href: "/admin/experiences/sunset-experience",
        id: "sunset-experience",
        label: "Sunset Experience",
        type: "experience",
      },
    ],
    variants: [
      {
        dimensions: "480 x 480",
        format: "WebP",
        id: "sunset-480",
        publicUrl: "/images/generated/landing/experience-sunset-toast-480.webp",
        sizeLabel: "54 KB",
        status: "ready",
        width: 480,
      },
      {
        dimensions: "720 x 720",
        format: "WebP",
        id: "sunset-720",
        publicUrl: "/images/generated/landing/experience-sunset-toast-720.webp",
        sizeLabel: "96 KB",
        status: "ready",
        width: 720,
      },
      {
        dimensions: "1024 x 1024",
        format: "WebP",
        id: "sunset-1024",
        publicUrl:
          "/images/generated/landing/experience-sunset-toast-1024.webp",
        sizeLabel: "186 KB",
        status: "ready",
        width: 1024,
      },
    ],
    workflow: [
      { at: "18:14", label: "Original received", status: "ready" },
      { at: "18:16", label: "Variants generated", status: "ready" },
      { at: "18:20", label: "Linked to experience", status: "ready" },
    ],
  },
  {
    altText: {
      ca: "Sortida privada de mati amb mar tranquil a Barcelona.",
      en: "Private morning charter on calm Barcelona water.",
      es: "Salida privada de mañana con mar tranquilo en Barcelona.",
    },
    absolutePublicUrl:
      "http://localhost:3000/images/generated/landing/experience-morning-breeze-1024.webp",
    collection: "Experiences",
    dimensions: "1024 x 1024",
    failureReason: null,
    filename: "experience-morning-breeze.webp",
    format: "WebP",
    hash: "b7e9d1",
    id: "morning-breeze-cover",
    originalPath:
      "/var/lib/jimboats/media/originals/experiences/morning-breeze.jpg",
    publicPath: "/media/experiences/morning-breeze-b7e9d1-1024.webp",
    publicUrl: "/images/generated/landing/experience-morning-breeze-1024.webp",
    sizeLabel: "172 KB",
    status: "processing",
    title: "Morning Breeze cover",
    updatedAt: "June 1, 2026, 09:10",
    usage: [
      {
        href: "/admin/experiences/morning-breeze",
        id: "morning-breeze",
        label: "Morning Breeze",
        type: "experience",
      },
    ],
    variants: [
      {
        dimensions: "480 x 480",
        format: "WebP",
        id: "morning-480",
        publicUrl:
          "/images/generated/landing/experience-morning-breeze-480.webp",
        sizeLabel: "49 KB",
        status: "ready",
        width: 480,
      },
      {
        dimensions: "720 x 720",
        format: "WebP",
        id: "morning-720",
        publicUrl:
          "/images/generated/landing/experience-morning-breeze-720.webp",
        sizeLabel: "88 KB",
        status: "processing",
        width: 720,
      },
      {
        dimensions: "1024 x 1024",
        format: "WebP",
        id: "morning-1024",
        publicUrl:
          "/images/generated/landing/experience-morning-breeze-1024.webp",
        sizeLabel: "172 KB",
        status: "processing",
        width: 1024,
      },
    ],
    workflow: [
      { at: "09:04", label: "Original received", status: "ready" },
      { at: "09:07", label: "Small variant generated", status: "ready" },
      { at: "09:10", label: "Large variants running", status: "processing" },
    ],
  },
  {
    altText: {
      ca: "Brindis amb cava premium durant una sortida privada en barco.",
      en: "Premium cava toast during a private boat charter.",
      es: "Brindis con cava premium durante una salida privada en barco.",
    },
    absolutePublicUrl:
      "http://localhost:3000/images/generated/landing/upgrade-sunset-toast-1024.webp",
    collection: "Extras",
    dimensions: "1024 x 1024",
    failureReason: null,
    filename: "upgrade-sunset-toast.webp",
    format: "WebP",
    hash: "c4d2f0",
    id: "premium-cava-extra",
    originalPath: "/var/lib/jimboats/media/originals/extras/premium-cava.jpg",
    publicPath: "/media/extras/premium-cava-c4d2f0-1024.webp",
    publicUrl: "/images/generated/landing/upgrade-sunset-toast-1024.webp",
    sizeLabel: "164 KB",
    status: "ready",
    title: "Premium cava extra",
    updatedAt: "May 30, 2026, 12:42",
    usage: [
      {
        href: "/admin/extras/premium-champagne",
        id: "premium-champagne",
        label: "Premium champagne",
        type: "extra",
      },
    ],
    variants: [
      {
        dimensions: "320 x 320",
        format: "WebP",
        id: "cava-320",
        publicUrl: "/images/generated/landing/upgrade-sunset-toast-320.webp",
        sizeLabel: "31 KB",
        status: "ready",
        width: 320,
      },
      {
        dimensions: "720 x 720",
        format: "WebP",
        id: "cava-720",
        publicUrl: "/images/generated/landing/upgrade-sunset-toast-720.webp",
        sizeLabel: "89 KB",
        status: "ready",
        width: 720,
      },
      {
        dimensions: "1024 x 1024",
        format: "WebP",
        id: "cava-1024",
        publicUrl: "/images/generated/landing/upgrade-sunset-toast-1024.webp",
        sizeLabel: "164 KB",
        status: "ready",
        width: 1024,
      },
    ],
    workflow: [
      { at: "12:35", label: "Original received", status: "ready" },
      { at: "12:39", label: "Variants generated", status: "ready" },
      { at: "12:42", label: "Ready for selection", status: "ready" },
    ],
  },
  {
    altText: {
      ca: "",
      en: "",
      es: "",
    },
    absolutePublicUrl:
      "http://localhost:3000/images/generated/landing/gallery-barcelona-coast-1024.webp",
    collection: "Gallery",
    dimensions: "1024 x 1024",
    failureReason: "Large variant failed.",
    filename: "gallery-barcelona-coast.webp",
    format: "WebP",
    hash: "e5a910",
    id: "barcelona-coast-gallery",
    originalPath:
      "/var/lib/jimboats/media/originals/gallery/barcelona-coast.jpg",
    publicPath: "/media/gallery/barcelona-coast-e5a910-1024.webp",
    publicUrl: "/images/generated/landing/gallery-barcelona-coast-1024.webp",
    sizeLabel: "198 KB",
    status: "failed",
    title: "Barcelona coast gallery",
    updatedAt: "May 29, 2026, 16:03",
    usage: [
      {
        href: "/admin/content/home-gallery",
        id: "home-gallery",
        label: "Home gallery",
        type: "gallery",
      },
    ],
    variants: [
      {
        dimensions: "480 x 480",
        format: "WebP",
        id: "coast-480",
        publicUrl: "/images/generated/landing/gallery-barcelona-coast-480.webp",
        sizeLabel: "61 KB",
        status: "ready",
        width: 480,
      },
      {
        dimensions: "720 x 720",
        format: "WebP",
        id: "coast-720",
        publicUrl: "/images/generated/landing/gallery-barcelona-coast-720.webp",
        sizeLabel: "104 KB",
        status: "failed",
        width: 720,
      },
      {
        dimensions: "1024 x 1024",
        format: "WebP",
        id: "coast-1024",
        publicUrl:
          "/images/generated/landing/gallery-barcelona-coast-1024.webp",
        sizeLabel: "198 KB",
        status: "failed",
        width: 1024,
      },
    ],
    workflow: [
      { at: "15:54", label: "Original received", status: "ready" },
      { at: "15:58", label: "Small variant generated", status: "ready" },
      { at: "16:03", label: "Large variant failed", status: "failed" },
    ],
  },
];

export function getAdminMediaPreviewPage(): AdminMediaPageData {
  return {
    assets: mediaAssets,
    navItems: adminNavItems,
  };
}

export async function getAdminMediaPage(): Promise<AdminMediaPageData> {
  if (process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1") {
    return getAdminMediaPreviewPage();
  }

  const { getContainer } = await import("@/container");
  const container = getContainer();
  const [mediaList, experiencesWorkspace, extrasWorkspace] = await Promise.all([
    container.adminMedia.listAssets(),
    container.adminExperiences.getWorkspace(),
    container.adminExtras.getWorkspace(),
  ]);

  return presentAdminMediaList(mediaList, experiencesWorkspace, extrasWorkspace);
}

export function presentAdminMediaList(
  list: AdminMediaListDto,
  experiencesWorkspace?: AdminExperiencesWorkspaceDto,
  extrasWorkspace?: AdminExtrasWorkspaceDto,
): AdminMediaPageData {
  const usageByAssetId = mediaUsageByAssetId(
    experiencesWorkspace,
    extrasWorkspace,
  );

  return {
    assets: list.assets.map((asset) =>
      presentAdminMediaAsset(asset, usageByAssetId),
    ),
    navItems: adminNavItems,
  };
}

function presentAdminMediaAsset(
  asset: AdminMediaAssetDto,
  usageByAssetId: Map<string, AdminMediaAsset["usage"]>,
): AdminMediaAsset {
  const primaryVariant = asset.primaryVariant ?? asset.variants[0] ?? null;

  return {
    altText: {
      ca: asset.altText.ca ?? "",
      en: asset.altText.en ?? "",
      es: asset.altText.es ?? "",
    },
    absolutePublicUrl: absolutePublicUrl(primaryVariant?.publicUrl ?? ""),
    collection: collectionLabel(asset.collection),
    dimensions: dimensionsLabel(asset.original.dimensions),
    failureReason: asset.failureReason,
    filename: asset.original.filename,
    format: formatLabel(primaryVariant?.format ?? asset.original.mimeType),
    hash: asset.original.hash.slice(0, 8),
    id: asset.id,
    originalPath: asset.original.privatePath,
    publicPath: primaryVariant?.publicPath ?? "",
    publicUrl: primaryVariant?.publicUrl ?? "",
    sizeLabel: bytesLabel(
      primaryVariant?.fileSizeBytes ?? asset.original.fileSizeBytes,
    ),
    status: mediaStatusToAdmin(asset.status),
    title: asset.title,
    updatedAt: dateTimeLabel(asset.updatedAt),
    usage: usageByAssetId.get(asset.id) ?? [],
    variants: asset.variants.map((variant) => ({
      dimensions: dimensionsLabel(variant.dimensions),
      format: formatLabel(variant.format),
      id: variant.id,
      publicUrl: variant.publicUrl,
      sizeLabel: bytesLabel(variant.fileSizeBytes),
      status: "ready",
      width: variant.dimensions.width,
    })),
    workflow: processingWorkflow(asset),
  };
}

function absolutePublicUrl(publicUrl: string) {
  if (!publicUrl) {
    return "";
  }

  return new URL(publicUrl, publicSiteUrlFromEnv()).toString();
}

function publicSiteUrlFromEnv() {
  const explicitUrl = process.env.PUBLIC_SITE_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const appDomain = process.env.APP_DOMAIN?.trim();

  if (appDomain) {
    return `https://${appDomain}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

function mediaUsageByAssetId(
  experiencesWorkspace?: AdminExperiencesWorkspaceDto,
  extrasWorkspace?: AdminExtrasWorkspaceDto,
) {
  const usageByAssetId = new Map<string, AdminMediaAsset["usage"]>();

  for (const item of experiencesWorkspace?.experiences ?? []) {
    const assetId = item.experience.media.assetId;

    if (!assetId) {
      continue;
    }

    const usage = usageByAssetId.get(assetId) ?? [];

    usage.push({
      href: `/admin/experiences/${item.experience.id}/media`,
      id: item.experience.id,
      label: item.experience.internalName,
      type: "experience",
    });
    usageByAssetId.set(assetId, usage);
  }

  for (const extra of extrasWorkspace?.extras ?? []) {
    const assetId = extra.primaryMediaAssetId;

    if (!assetId) {
      continue;
    }

    const usage = usageByAssetId.get(assetId) ?? [];

    usage.push({
      href: `/admin/extras/${extra.id}`,
      id: extra.id,
      label: extra.name,
      type: "extra",
    });
    usageByAssetId.set(assetId, usage);
  }

  for (const usage of usageByAssetId.values()) {
    usage.sort((left, right) => left.label.localeCompare(right.label));
  }

  return usageByAssetId;
}

function processingWorkflow(asset: AdminMediaAssetDto) {
  const events: AdminMediaAsset["workflow"] = [
    {
      at: timeLabel(asset.createdAt),
      label: "Original received",
      status: "ready",
    },
  ];

  if (asset.status === "READY") {
    events.push({
      at: timeLabel(asset.updatedAt),
      label: "Variants generated",
      status: "ready",
    });
  } else if (asset.status === "FAILED") {
    events.push({
      at: timeLabel(asset.updatedAt),
      label: asset.failureReason ?? "Processing failed",
      status: "failed",
    });
  } else {
    events.push({
      at: timeLabel(asset.updatedAt),
      label: "Waiting for media worker",
      status: "processing",
    });
  }

  return events;
}

function collectionLabel(
  collection: AdminMediaAssetDto["collection"],
): AdminMediaAsset["collection"] {
  const labels = {
    EXPERIENCES: "Experiences",
    EXTRAS: "Extras",
    GALLERY: "Gallery",
    PAGES: "Pages",
  } satisfies Record<
    AdminMediaAssetDto["collection"],
    AdminMediaAsset["collection"]
  >;

  return labels[collection];
}

function mediaStatusToAdmin(
  status: AdminMediaAssetDto["status"],
): AdminMediaAsset["status"] {
  const statuses = {
    FAILED: "failed",
    PROCESSING: "processing",
    READY: "ready",
  } satisfies Record<AdminMediaAssetDto["status"], AdminMediaAsset["status"]>;

  return statuses[status];
}

function formatLabel(format: string) {
  if (format === "image/jpeg") {
    return "JPEG";
  }

  if (format === "image/png") {
    return "PNG";
  }

  return format.toUpperCase();
}

function dimensionsLabel(dimensions: { height: number; width: number }) {
  return `${dimensions.width} x ${dimensions.height}`;
}

function bytesLabel(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function dateTimeLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
