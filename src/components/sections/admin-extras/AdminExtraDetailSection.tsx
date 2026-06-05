import { ArrowLeft, ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  FieldGrid,
  NumberField,
  SelectField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Button } from "@/components/ui/Button";
import { DynamicMediaImage } from "@/components/ui/DynamicMediaImage";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/design/variants";

import type {
  AdminExtra,
  AdminExtraMedia,
  AdminExtraMediaAssetOption,
  AdminExtraMutation,
} from "./AdminExtraTypes";
import { ExtraStatusBadge } from "./AdminExtrasListSection";

type AdminExtraDetailSectionProps = {
  archiveExtra: (extraId: string) => Promise<void>;
  extra: AdminExtra;
  mediaAssets: AdminExtraMediaAssetOption[];
  updateExtra: AdminExtraMutation;
};

export function AdminExtraDetailSection({
  archiveExtra,
  extra,
  mediaAssets,
  updateExtra,
}: AdminExtraDetailSectionProps) {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            className="inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            href="/admin/extras"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Extras
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">
              {extra.name}
            </h1>
            <ExtraStatusBadge status={extra.status} />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Configure the operational data used by checkout and experience
            compatibility.
          </p>
        </div>
        <Button
          disabled={extra.status === "archived"}
          onClick={() => void archiveExtra(extra.id)}
          variant="secondary"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Archive
        </Button>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Surface
          description="These values are reused wherever the extra is offered."
          title="Base configuration"
        >
          <div className="space-y-4">
            <TextField
              label="Name"
              onChange={(event) =>
                updateExtra((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              value={extra.name}
            />
            <FieldGrid columns={3}>
              <NumberField
                label="Price"
                min={0}
                onChange={(event) =>
                  updateExtra((current) => ({
                    ...current,
                    price: Number(event.target.value),
                  }))
                }
                value={extra.price}
              />
              <NumberField
                label="Default notice hours"
                min={0}
                onChange={(event) =>
                  updateExtra((current) => ({
                    ...current,
                    defaultNoticeHours: Number(event.target.value),
                  }))
                }
                value={extra.defaultNoticeHours}
              />
              <SelectField
                label="Status"
                onChange={(event) =>
                  updateExtra((current) => ({
                    ...current,
                    status: event.target.value as AdminExtra["status"],
                  }))
                }
                value={extra.status}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </SelectField>
            </FieldGrid>
          </div>
        </Surface>

        <Surface
          description="Primary image used in admin cards and future public surfaces."
          title="Primary media"
        >
          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
              <DynamicMediaImage
                alt=""
                className="h-full w-full"
                fallback={<ImageIcon className="size-8" aria-hidden="true" />}
                src={extra.media.primaryImageUrl}
                variants={extra.media.variants}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={!extra.media.assetId}
                onClick={() =>
                  updateExtra((current) => ({
                    ...current,
                    media: missingMedia(),
                  }))
                }
                variant="secondary"
              >
                Clear image
              </Button>
              <Button href="/admin/media" variant="secondary">
                Media library
              </Button>
            </div>
          </div>
        </Surface>
      </div>

      <Surface
        description="Choose from assets uploaded to the Extras collection."
        title="Available extra images"
      >
        {mediaAssets.length === 0 ? (
          <div className="flex flex-col items-start gap-3 text-sm text-slate-600">
            <p>No extra images are available yet.</p>
            <Button href="/admin/media" variant="secondary">
              Upload media
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mediaAssets.map((asset) => (
              <MediaAssetChoice
                asset={asset}
                isSelected={extra.media.assetId === asset.assetId}
                key={asset.assetId}
                onSelect={() =>
                  updateExtra((current) => ({
                    ...current,
                    media: mediaFromAssetOption(asset),
                  }))
                }
              />
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
}

function MediaAssetChoice({
  asset,
  isSelected,
  onSelect,
}: {
  asset: AdminExtraMediaAssetOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "grid min-h-28 grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-md border bg-white p-3 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
        isSelected ? "border-sky-700" : "border-slate-200",
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="block size-[88px] overflow-hidden rounded-md bg-slate-100">
        <DynamicMediaImage
          alt=""
          className="h-full w-full"
          fallback={<ImageIcon className="size-5" aria-hidden="true" />}
          src={asset.primaryImageUrl}
          variants={asset.variants}
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-slate-950">
          {asset.title}
        </span>
        <span className="mt-1 block truncate text-xs text-slate-600">
          {asset.filename}
        </span>
        <span className="mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {asset.status}
        </span>
      </span>
    </button>
  );
}

function mediaFromAssetOption(
  asset: AdminExtraMediaAssetOption,
): AdminExtraMedia {
  return {
    assetId: asset.assetId,
    filename: asset.filename,
    primaryImageUrl: asset.primaryImageUrl,
    status: asset.status,
    title: asset.title,
    variants: asset.variants,
  };
}

function missingMedia(): AdminExtraMedia {
  return {
    assetId: null,
    filename: "",
    primaryImageUrl: "",
    status: "missing",
    title: "",
    variants: [],
  };
}
