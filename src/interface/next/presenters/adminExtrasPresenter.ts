import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminExtra,
  AdminExtraMedia,
  AdminExtraMediaAssetOption,
  AdminExtrasPageData,
} from "@/components/sections/admin-extras/AdminExtraTypes";
import type {
  AdminExtraDto,
  AdminExtrasWorkspaceDto,
} from "@/modules/experience-catalog/application/AdminExtraDtos";
import type { AdminMediaListDto } from "@/modules/media-library/application/AdminMediaDtos";

const previewExtraMediaAssets: AdminExtraMediaAssetOption[] = [
  previewMediaAsset({
    assetId: "premium-champagne-cover",
    filename: "upgrade-sunset-toast.webp",
    imageBase: "upgrade-sunset-toast",
    title: "Premium champagne cover",
  }),
  previewMediaAsset({
    assetId: "mediterranean-snacks-cover",
    filename: "upgrade-mediterranean-flavors.webp",
    imageBase: "upgrade-mediterranean-flavors",
    title: "Mediterranean snacks cover",
  }),
  previewMediaAsset({
    assetId: "paddle-surf-cover",
    filename: "upgrade-paddle-surf.webp",
    imageBase: "upgrade-paddle-surf",
    title: "Paddle surf cover",
  }),
];

const previewExtras: AdminExtra[] = [
  {
    defaultNoticeHours: 24,
    id: "premium-champagne",
    media: mediaFromAssetOption(previewExtraMediaAssets[0]),
    name: "Premium champagne",
    price: 90,
    status: "active",
  },
  {
    defaultNoticeHours: 48,
    id: "mediterranean-snacks",
    media: mediaFromAssetOption(previewExtraMediaAssets[1]),
    name: "Mediterranean snacks",
    price: 65,
    status: "active",
  },
  {
    defaultNoticeHours: 12,
    id: "paddle-surf",
    media: mediaFromAssetOption(previewExtraMediaAssets[2]),
    name: "Paddle surf",
    price: 45,
    status: "draft",
  },
];

export function getAdminExtrasPreviewPage(): AdminExtrasPageData {
  return {
    navItems: adminNavItems,
    state: {
      extras: previewExtras,
      mediaAssets: previewExtraMediaAssets,
    },
  };
}

export async function getAdminExtrasPage(): Promise<AdminExtrasPageData> {
  if (process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1") {
    return getAdminExtrasPreviewPage();
  }

  const { getContainer } = await import("@/container");
  const container = getContainer();
  const [workspace, mediaList] = await Promise.all([
    container.adminExtras.getWorkspace(),
    container.adminMedia.listAssets(),
  ]);

  return {
    navItems: adminNavItems,
    state: presentAdminExtrasWorkspace(workspace, mediaList),
  };
}

export function presentAdminExtrasWorkspace(
  workspace: AdminExtrasWorkspaceDto,
  mediaList?: AdminMediaListDto,
): AdminExtrasPageData["state"] {
  const mediaAssets = mediaList ? presentExtraMediaAssets(mediaList) : [];
  const mediaAssetsById = new Map(
    mediaAssets.map((asset) => [asset.assetId, asset]),
  );

  return {
    extras: workspace.extras.map((extra) => presentExtra(extra, mediaAssetsById)),
    mediaAssets,
  };
}

function presentExtra(
  extra: AdminExtraDto,
  mediaAssetsById: Map<string, AdminExtraMediaAssetOption>,
): AdminExtra {
  return {
    defaultNoticeHours: Math.round(extra.defaultNoticeMinutes / 60),
    id: extra.id,
    media: presentExtraMedia(extra.primaryMediaAssetId, mediaAssetsById),
    name: extra.name,
    price: fromMoney(extra.price),
    status: extra.status.toLowerCase() as AdminExtra["status"],
  };
}

function presentExtraMediaAssets(
  mediaList: AdminMediaListDto,
): AdminExtraMediaAssetOption[] {
  return mediaList.assets
    .filter((asset) => asset.collection === "EXTRAS")
    .map((asset) => {
      const primaryVariant = asset.primaryVariant ?? asset.variants[0] ?? null;

      return {
        assetId: asset.id,
        collection: collectionLabel(asset.collection),
        filename: asset.original.filename,
        primaryImageUrl: primaryVariant?.publicUrl ?? "",
        status: mediaStatusToAdmin(asset.status),
        title: asset.title,
        variants: asset.variants.map((variant) => ({
          publicUrl: variant.publicUrl,
          width: variant.dimensions.width,
        })),
      };
    })
    .sort((left, right) => {
      if (left.status === "ready" && right.status !== "ready") {
        return -1;
      }

      if (left.status !== "ready" && right.status === "ready") {
        return 1;
      }

      return left.title.localeCompare(right.title);
    });
}

function presentExtraMedia(
  assetId: string | null,
  mediaAssetsById: Map<string, AdminExtraMediaAssetOption>,
): AdminExtraMedia {
  const normalizedAssetId = assetId?.trim() || null;

  if (!normalizedAssetId) {
    return missingExtraMedia();
  }

  const asset = mediaAssetsById.get(normalizedAssetId);

  if (asset) {
    return mediaFromAssetOption(asset);
  }

  return {
    assetId: normalizedAssetId,
    filename: normalizedAssetId,
    primaryImageUrl: "",
    status: "missing",
    title: "Missing media asset",
    variants: [],
  };
}

function mediaFromAssetOption(asset: AdminExtraMediaAssetOption): AdminExtraMedia {
  return {
    assetId: asset.assetId,
    filename: asset.filename,
    primaryImageUrl: asset.primaryImageUrl,
    status: asset.status,
    title: asset.title,
    variants: asset.variants,
  };
}

function missingExtraMedia(): AdminExtraMedia {
  return {
    assetId: null,
    filename: "",
    primaryImageUrl: "",
    status: "missing",
    title: "",
    variants: [],
  };
}

function previewMediaAsset(input: {
  assetId: string;
  filename: string;
  imageBase: string;
  title: string;
}): AdminExtraMediaAssetOption {
  return {
    assetId: input.assetId,
    collection: "Extras",
    filename: input.filename,
    primaryImageUrl: `/images/generated/landing/${input.imageBase}-720.webp`,
    status: "ready",
    title: input.title,
    variants: [
      {
        publicUrl: `/images/generated/landing/${input.imageBase}-480.webp`,
        width: 480,
      },
      {
        publicUrl: `/images/generated/landing/${input.imageBase}-720.webp`,
        width: 720,
      },
    ],
  };
}

function mediaStatusToAdmin(status: "FAILED" | "PROCESSING" | "READY") {
  if (status === "FAILED") {
    return "failed" as const;
  }

  if (status === "PROCESSING") {
    return "processing" as const;
  }

  return "ready" as const;
}

function collectionLabel(
  collection: "EXPERIENCES" | "EXTRAS" | "GALLERY" | "PAGES",
) {
  const labels = {
    EXPERIENCES: "Experiences",
    EXTRAS: "Extras",
    GALLERY: "Gallery",
    PAGES: "Pages",
  } as const;

  return labels[collection];
}

function fromMoney(input: AdminExtraDto["price"]) {
  return input.amountMinor / 100;
}
