import { ImageIcon, Library, Trash2 } from "lucide-react";
import { useState } from "react";

import { SelectField, TextField } from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicMediaImage } from "@/components/ui/DynamicMediaImage";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/design/variants";

import { MediaStatusBadge } from "./AdminExperienceBadges";
import type {
  AdminExperience,
  AdminExperienceMedia,
  AdminExperienceMediaAssetOption,
  AdminExperienceMutation,
  AdminLocaleCode,
} from "./AdminExperienceTypes";

type AdminExperienceMediaSectionProps = {
  experience: AdminExperience;
  locales: AdminLocaleCode[];
  mediaAssets: AdminExperienceMediaAssetOption[];
  updateExperience: AdminExperienceMutation;
};

export function AdminExperienceMediaSection({
  experience,
  locales,
  mediaAssets,
  updateExperience,
}: AdminExperienceMediaSectionProps) {
  const [selectedLocale, setSelectedLocale] = useState<AdminLocaleCode>("en");
  const translation = experience.translations[selectedLocale];

  const assignAsset = (asset: AdminExperienceMediaAssetOption) => {
    updateExperience((current) => ({
      ...current,
      media: mediaFromAsset(asset),
    }));
  };

  const clearAsset = () => {
    updateExperience((current) => ({
      ...current,
      media: missingMedia(),
    }));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Surface
        action={
          <Button href="/admin/media" size="sm" variant="secondary">
            <Library className="size-4" aria-hidden="true" />
            Media library
          </Button>
        }
        description="Choose the primary image from processed Experience assets in Media Library."
        title="Primary image"
      >
        <div className="space-y-5">
          <MediaPreview experience={experience} alt={translation.altText} />

          <SelectedAssetSummary
            experience={experience}
            onClear={clearAsset}
          />

          <MediaAssetPicker
            assets={mediaAssets}
            onSelect={assignAsset}
            selectedAssetId={experience.media.assetId}
          />
        </div>
      </Surface>

      <aside aria-label="Media summary" className="space-y-5">
        <Surface title="Processing">
          <div className="space-y-3">
            <StatusLine
              label="Media asset selected"
              ready={Boolean(experience.media.assetId)}
            />
            <StatusLine
              label="Responsive variants"
              ready={
                experience.media.status === "ready" &&
                experience.media.variants.length > 0
              }
            />
            <StatusLine
              label="Public-safe alt text"
              ready={Boolean(translation.altText)}
            />
          </div>
        </Surface>

        <Surface title="Alt text by locale">
          <div className="space-y-4">
            <SelectField
              label="Locale"
              onChange={(event) =>
                setSelectedLocale(event.target.value as AdminLocaleCode)
              }
              value={selectedLocale}
            >
              {locales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale.toUpperCase()}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Alt text"
              onChange={(event) =>
                updateExperience((current) => ({
                  ...current,
                  translations: {
                    ...current.translations,
                    [selectedLocale]: {
                      ...current.translations[selectedLocale],
                      altText: event.target.value,
                    },
                  },
                }))
              }
              value={translation.altText}
            />
          </div>
        </Surface>
      </aside>
    </div>
  );
}

function MediaPreview({
  alt,
  experience,
}: {
  alt: string;
  experience: AdminExperience;
}) {
  if (!experience.media.primaryImageUrl) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
        <span className="flex items-center gap-2">
          <ImageIcon className="size-5" aria-hidden="true" />
          No primary image selected
        </span>
      </div>
    );
  }

  return (
    <DynamicMediaImage
      alt={alt}
      className="aspect-[16/10] overflow-hidden rounded-lg"
      fallback={
        <span className="flex items-center gap-2 text-sm font-semibold">
          <ImageIcon className="size-5" aria-hidden="true" />
          Image unavailable
        </span>
      }
      imageClassName="rounded-lg"
      sizes="(min-width: 1280px) 760px, 100vw"
      src={experience.media.primaryImageUrl}
      variants={experience.media.variants}
    />
  );
}

function SelectedAssetSummary({
  experience,
  onClear,
}: {
  experience: AdminExperience;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">
          {experience.media.title || "No asset selected"}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {experience.media.filename || "Select a ready asset from Media Library"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <MediaStatusBadge status={experience.media.status} />
        <Button
          disabled={!experience.media.assetId}
          onClick={onClear}
          size="sm"
          variant="secondary"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Remove
        </Button>
      </div>
    </div>
  );
}

function MediaAssetPicker({
  assets,
  onSelect,
  selectedAssetId,
}: {
  assets: AdminExperienceMediaAssetOption[];
  onSelect: (asset: AdminExperienceMediaAssetOption) => void;
  selectedAssetId: string | null;
}) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
        <p className="text-sm font-semibold text-slate-950">
          No Experience media assets yet.
        </p>
        <Button href="/admin/media" size="sm" variant="secondary">
          <Library className="size-4" aria-hidden="true" />
          Open Media Library
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-950">
        Available Experience assets
      </h3>
      <div className="mt-3 space-y-3">
        {assets.map((asset) => {
          const isSelected = asset.assetId === selectedAssetId;
          const canSelect = asset.status === "ready";

          return (
            <button
              aria-label={`Use ${asset.title}`}
              aria-pressed={isSelected}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border border-slate-200 bg-white p-3 text-left transition",
                "hover:border-sky-300 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
                isSelected && "border-sky-700 bg-sky-50",
                !canSelect && "cursor-not-allowed opacity-70 hover:bg-white",
              )}
              disabled={!canSelect}
              key={asset.assetId}
              onClick={() => onSelect(asset)}
              type="button"
            >
              <AssetThumb asset={asset} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-950">
                  {asset.title}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-700">
                  {asset.filename}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <MediaStatusBadge status={asset.status} />
                {isSelected ? (
                  <Badge size="sm" tone="sky">
                    Assigned
                  </Badge>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AssetThumb({ asset }: { asset: AdminExperienceMediaAssetOption }) {
  if (!asset.primaryImageUrl) {
    return (
      <span className="flex size-16 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
        <ImageIcon className="size-5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <DynamicMediaImage
      alt=""
      className="size-16 shrink-0 overflow-hidden rounded-md"
      fallback={<ImageIcon className="size-5" aria-hidden="true" />}
      sizes="64px"
      src={asset.primaryImageUrl}
      variants={asset.variants}
    />
  );
}

function StatusLine({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <Badge size="sm" tone={ready ? "emerald" : "amber"}>
        {ready ? "Ready" : "Open"}
      </Badge>
    </div>
  );
}

function mediaFromAsset(
  asset: AdminExperienceMediaAssetOption,
): AdminExperienceMedia {
  return {
    assetId: asset.assetId,
    filename: asset.filename,
    primaryImageUrl: asset.primaryImageUrl,
    status: asset.status,
    title: asset.title,
    variants: asset.variants,
  };
}

function missingMedia(): AdminExperienceMedia {
  return {
    assetId: null,
    filename: "",
    primaryImageUrl: "",
    status: "missing",
    title: "",
    variants: [],
  };
}
