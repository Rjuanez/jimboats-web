import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";

import { TextAreaField } from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminMediaAsset,
  AdminMediaProcessingEvent,
  AdminMediaStatus,
  AdminMediaVariant,
} from "./AdminMediaTypes";

type AdminMediaDetailSectionProps = {
  asset: AdminMediaAsset;
};

export function AdminMediaDetailSection({
  asset,
}: AdminMediaDetailSectionProps) {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <Button href="/admin/media" variant="secondary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Media library
          </Button>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">
              {asset.title}
            </h1>
            <MediaStatusBadge status={asset.status} />
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {asset.filename} · {asset.dimensions} · {asset.sizeLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled variant="secondary">
            <UploadCloud className="size-4" aria-hidden="true" />
            Upload revision
          </Button>
          <Button disabled variant="secondary">
            <RefreshCw className="size-4" aria-hidden="true" />
            Reprocess
          </Button>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Surface
          className="min-w-0"
          title="Preview"
          description="Primary visual used by catalog surfaces."
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-slate-100">
            <Image
              alt={asset.altText.en || asset.title}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1280px) 60vw, 100vw"
              src={asset.publicUrl}
            />
          </div>
        </Surface>

        <Surface className="min-w-0" title="Asset metadata">
          <dl className="grid gap-3 text-sm">
            <MetadataRow label="Collection" value={asset.collection} />
            <MetadataRow label="Format" value={asset.format} />
            <MetadataRow label="Hash" value={asset.hash} />
            <MetadataRow label="Updated" value={asset.updatedAt} />
            <MetadataRow label="Original" value={asset.originalPath} />
            <MetadataRow label="Public path" value={asset.publicPath} />
          </dl>
        </Surface>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <Surface
            className="min-w-0"
            title="Generated variants"
            description="Responsive files prepared for public rendering and cache."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                    <th className="px-3 py-3 font-semibold">Width</th>
                    <th className="px-3 py-3 font-semibold">Dimensions</th>
                    <th className="px-3 py-3 font-semibold">Format</th>
                    <th className="px-3 py-3 font-semibold">Size</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Asset
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {asset.variants.map((variant) => (
                    <VariantRow key={variant.id} variant={variant} />
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>

          <Surface
            className="min-w-0"
            title="Localized alt text"
            description="Editorial text used when the image communicates meaning."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <TextAreaField
                label="EN alt text"
                readOnly
                value={asset.altText.en}
              />
              <TextAreaField
                label="ES alt text"
                readOnly
                value={asset.altText.es}
              />
              <TextAreaField
                label="CA alt text"
                readOnly
                value={asset.altText.ca}
              />
            </div>
          </Surface>
        </div>

        <div className="min-w-0 space-y-5">
          <Surface className="min-w-0" title="Usage">
            <div className="space-y-3">
              {asset.usage.map((usage) => (
                <a
                  className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                  href={usage.href}
                  key={usage.id}
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-950">
                      {usage.label}
                    </span>
                    <span className="mt-0.5 block text-xs uppercase tracking-wide text-slate-500">
                      {usage.type}
                    </span>
                  </span>
                  <ExternalLink
                    className="size-4 shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </Surface>

          <Surface className="min-w-0" title="Processing log">
            <div className="space-y-3">
              {asset.workflow.map((event) => (
                <ProcessingEvent
                  event={event}
                  key={`${event.at}-${event.label}`}
                />
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </dt>
      <dd className="mt-1 break-all font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function VariantRow({ variant }: { variant: AdminMediaVariant }) {
  return (
    <tr className="border-b border-slate-200 align-top">
      <td className="px-3 py-4 font-semibold text-slate-950">
        {variant.width}px
      </td>
      <td className="px-3 py-4 text-slate-600">{variant.dimensions}</td>
      <td className="px-3 py-4 text-slate-600">{variant.format}</td>
      <td className="px-3 py-4 text-slate-600">{variant.sizeLabel}</td>
      <td className="px-3 py-4">
        <MediaStatusBadge status={variant.status} />
      </td>
      <td className="px-3 py-4 text-right">
        <a
          className="text-sm font-semibold text-sky-700 transition hover:text-sky-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
          href={variant.publicUrl}
        >
          Open file
        </a>
      </td>
    </tr>
  );
}

function ProcessingEvent({ event }: { event: AdminMediaProcessingEvent }) {
  const Icon = {
    failed: AlertTriangle,
    processing: Clock3,
    ready: CheckCircle2,
  }[event.status];

  return (
    <div className="flex gap-3 rounded-md border border-slate-200 px-3 py-3">
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">{event.label}</p>
        <p className="mt-1 text-xs text-slate-500">{event.at}</p>
      </div>
    </div>
  );
}

function MediaStatusBadge({ status }: { status: AdminMediaStatus }) {
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

function statusLabel(status: AdminMediaStatus) {
  const labels = {
    failed: "Failed",
    processing: "Processing",
    ready: "Ready",
  } satisfies Record<AdminMediaStatus, string>;

  return labels[status];
}
