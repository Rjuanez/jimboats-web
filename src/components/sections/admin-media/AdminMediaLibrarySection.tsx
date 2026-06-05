"use client";

import {
  ArrowRight,
  Image as ImageIcon,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { TextField } from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicMediaImage } from "@/components/ui/DynamicMediaImage";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/design/variants";

import { AdminMediaUploadPanel } from "./AdminMediaUploadPanel";
import type { AdminMediaAsset, AdminMediaStatus } from "./AdminMediaTypes";

type AdminMediaLibrarySectionProps = {
  assets: AdminMediaAsset[];
  isSaving: boolean;
  uploadAsset: (input: FormData) => Promise<string | null>;
};

type StatusFilter = AdminMediaStatus | "all";

const statusOptions: StatusFilter[] = ["all", "ready", "processing", "failed"];

export function AdminMediaLibrarySection({
  assets,
  isSaving,
  uploadAsset,
}: AdminMediaLibrarySectionProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const collections = useMemo(() => {
    return Array.from(new Set(assets.map((asset) => asset.collection))).sort();
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assets.filter((asset) => {
      if (statusFilter !== "all" && asset.status !== statusFilter) {
        return false;
      }

      if (collectionFilter !== "all" && asset.collection !== collectionFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        asset.title.toLowerCase().includes(normalizedQuery) ||
        asset.filename.toLowerCase().includes(normalizedQuery) ||
        asset.collection.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [assets, collectionFilter, query, statusFilter]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Assets
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950">
            Media library
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Review images used by experiences, extras and public content.
          </p>
        </div>
      </header>

      <MediaStats assets={assets} />
      <AdminMediaUploadPanel isSaving={isSaving} uploadAsset={uploadAsset} />

      <Surface
        title="Library workspace"
        description="Search, filter and open media assets before assigning them to catalog content."
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-xl flex-1">
            <TextField
              label="Search media"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, filename or collection"
              value={query}
            />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <FilterGroup label="Status">
              {statusOptions.map((status) => (
                <FilterButton
                  active={statusFilter === status}
                  key={status}
                  label={status === "all" ? "All" : statusLabel(status)}
                  onClick={() => setStatusFilter(status)}
                />
              ))}
            </FilterGroup>
            <FilterGroup label="Collection">
              <FilterButton
                active={collectionFilter === "all"}
                label="All"
                onClick={() => setCollectionFilter("all")}
              />
              {collections.map((collection) => (
                <FilterButton
                  active={collectionFilter === collection}
                  key={collection}
                  label={collection}
                  onClick={() => setCollectionFilter(collection)}
                />
              ))}
            </FilterGroup>
          </div>
        </div>

        {filteredAssets.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filteredAssets.map((asset) => (
              <MediaAssetCard asset={asset} key={asset.id} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
            <Search
              className="mx-auto size-6 text-slate-400"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-semibold text-slate-950">
              No media assets match these filters.
            </p>
          </div>
        )}
      </Surface>
    </div>
  );
}

function MediaStats({ assets }: { assets: AdminMediaAsset[] }) {
  const stats = [
    { label: "Assets", value: assets.length },
    {
      label: "Ready",
      value: assets.filter((asset) => asset.status === "ready").length,
    },
    {
      label: "Processing",
      value: assets.filter((asset) => asset.status === "processing").length,
    },
    {
      label: "In use",
      value: assets.filter((asset) => asset.usage.length > 0).length,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm"
          key={stat.label}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function FilterGroup({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "min-h-10 rounded-md border px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function MediaAssetCard({ asset }: { asset: AdminMediaAsset }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-slate-100">
        {asset.publicUrl ? (
          <DynamicMediaImage
            alt={asset.altText.en || asset.title}
            className="h-full w-full"
            fallback={
              <ImageIcon className="size-8 text-slate-400" aria-hidden="true" />
            }
            imageClassName="object-cover"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            src={asset.publicUrl}
            variants={asset.variants}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="size-8 text-slate-400" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <MediaStatusBadge status={asset.status} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <a
              className="font-semibold text-slate-950 transition hover:text-sky-700"
              href={`/admin/media/${asset.id}`}
            >
              {asset.title}
            </a>
            <p className="mt-1 truncate text-xs text-slate-500">
              {asset.filename}
            </p>
          </div>
          <Badge size="sm" tone="neutral">
            {asset.collection}
          </Badge>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Metric label="Size" value={asset.sizeLabel} />
          <Metric label="Format" value={asset.format} />
          <Metric label="Usage" value={`${asset.usage.length}`} />
          <Metric label="Variants" value={`${asset.variants.length}`} />
        </dl>
        <Button
          className="mt-4 w-full"
          href={`/admin/media/${asset.id}`}
          variant="secondary"
        >
          Open asset
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

export function MediaStatusBadge({ status }: { status: AdminMediaStatus }) {
  const tone = {
    failed: "rose",
    processing: "amber",
    ready: "emerald",
  } satisfies Record<AdminMediaStatus, "amber" | "emerald" | "rose">;

  return (
    <Badge size="sm" tone={tone[status]}>
      {statusLabel(status)}
    </Badge>
  );
}

export function statusLabel(status: AdminMediaStatus) {
  const labels = {
    failed: "Failed",
    processing: "Processing",
    ready: "Ready",
  } satisfies Record<AdminMediaStatus, string>;

  return labels[status];
}
