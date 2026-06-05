import { History, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";

import type { AdminBookingAuditEntry } from "./AdminBookingTypes";

type AdminBookingAuditTimelineProps = {
  entries: AdminBookingAuditEntry[];
};

export function AdminBookingAuditTimeline({
  entries,
}: AdminBookingAuditTimelineProps) {
  return (
    <Surface
      description="Operational changes recorded by the backpanel."
      title="Activity"
    >
      {entries.length === 0 ? <EmptyAuditTimeline /> : null}
      {entries.length > 0 ? (
        <ol className="space-y-4">
          {entries.map((entry) => (
            <AuditTimelineItem entry={entry} key={entry.id} />
          ))}
        </ol>
      ) : null}
    </Surface>
  );
}

function EmptyAuditTimeline() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3">
      <History className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">No activity yet</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          New changes to this booking will appear here.
        </p>
      </div>
    </div>
  );
}

function AuditTimelineItem({ entry }: { entry: AdminBookingAuditEntry }) {
  return (
    <li className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3">
      <span
        className="mt-2 size-2 rounded-full bg-slate-900 ring-4 ring-slate-100"
        aria-hidden="true"
      />
      <div className="min-w-0 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" tone={entry.tone}>
            {entry.actionLabel}
          </Badge>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {entry.createdAtLabel}
          </p>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-700">{entry.detail}</p>
        {entry.reason ? (
          <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
            {entry.reason}
          </p>
        ) : null}
        <p className="mt-2 flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{entry.actorLabel}</span>
        </p>
      </div>
    </li>
  );
}
