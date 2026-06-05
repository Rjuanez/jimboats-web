import { ImageIcon, Plus, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicMediaImage } from "@/components/ui/DynamicMediaImage";
import { Surface } from "@/components/ui/Surface";

import type { AdminExtra, AdminExtrasState } from "./AdminExtraTypes";

type AdminExtrasListSectionProps = {
  archiveExtra: (extraId: string) => Promise<void>;
  state: AdminExtrasState;
};

export function AdminExtrasListSection({
  archiveExtra,
  state,
}: AdminExtrasListSectionProps) {
  const activeExtras = state.extras.filter((extra) => extra.status === "active");
  const extrasWithMedia = state.extras.filter((extra) => {
    return Boolean(extra.media.assetId);
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Operations
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">
            Extras
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Configure the add-ons that can be attached to boat experiences.
          </p>
        </div>
        <Button href="/admin/extras/new">
          <Plus className="size-4" aria-hidden="true" />
          New extra
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Total extras" value={state.extras.length.toString()} />
        <Metric label="Active" value={activeExtras.length.toString()} />
        <Metric label="With media" value={extrasWithMedia.length.toString()} />
      </div>

      <Surface
        bodyClassName="p-0"
        description="Operational catalog used by experience compatibility rules."
        title="Extra catalog"
      >
        {state.extras.length === 0 ? (
          <EmptyExtras />
        ) : (
          <div className="divide-y divide-slate-200">
            {state.extras.map((extra) => (
              <ExtraListItem
                archiveExtra={archiveExtra}
                extra={extra}
                key={extra.id}
              />
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Surface className="shadow-none">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
        {value}
      </p>
    </Surface>
  );
}

function EmptyExtras() {
  return (
    <div className="flex flex-col items-start gap-4 px-4 py-10 sm:px-5">
      <div className="flex items-center gap-3 text-slate-700">
        <Settings2 className="size-5 text-sky-700" aria-hidden="true" />
        <p className="text-sm leading-6">
          No extras have been configured yet.
        </p>
      </div>
      <Button href="/admin/extras/new" variant="secondary">
        Create first extra
      </Button>
    </div>
  );
}

function ExtraListItem({
  archiveExtra,
  extra,
}: {
  archiveExtra: (extraId: string) => Promise<void>;
  extra: AdminExtra;
}) {
  return (
    <article className="grid gap-4 px-4 py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:px-5">
      <div className="size-[72px] overflow-hidden rounded-md bg-slate-100">
        <DynamicMediaImage
          alt=""
          className="h-full w-full"
          fallback={<ImageIcon className="size-5" aria-hidden="true" />}
          src={extra.media.primaryImageUrl}
          variants={extra.media.variants}
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-slate-950">
            {extra.name}
          </h2>
          <ExtraStatusBadge status={extra.status} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
          <span>EUR {extra.price.toLocaleString("en-US")}</span>
          <span>{extra.defaultNoticeHours}h notice</span>
          <span>{extra.media.assetId ? "Media linked" : "No media"}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button href={`/admin/extras/${extra.id}`} variant="secondary">
          Edit
        </Button>
        <Button
          disabled={extra.status === "archived"}
          onClick={() => void archiveExtra(extra.id)}
          variant="secondary"
        >
          Archive
        </Button>
      </div>
    </article>
  );
}

export function ExtraStatusBadge({ status }: { status: AdminExtra["status"] }) {
  if (status === "active") {
    return (
      <Badge size="sm" tone="emerald">
        Active
      </Badge>
    );
  }

  if (status === "archived") {
    return (
      <Badge size="sm" tone="neutral">
        Archived
      </Badge>
    );
  }

  return (
    <Badge size="sm" tone="amber">
      Draft
    </Badge>
  );
}
