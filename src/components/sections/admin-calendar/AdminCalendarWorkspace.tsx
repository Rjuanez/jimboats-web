"use client";

import { CalendarDays, Clock3, Lock, Unlock } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import {
  FieldGrid,
  TextAreaField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminCalendarActions,
  AdminCalendarBlock,
  AdminCalendarManualBlockInput,
  AdminCalendarPageData,
  AdminCalendarState,
} from "./AdminCalendarTypes";

type AdminCalendarWorkspaceProps = {
  actions: AdminCalendarActions;
  pageData: AdminCalendarPageData;
};

export function AdminCalendarWorkspace({
  actions,
  pageData,
}: AdminCalendarWorkspaceProps) {
  const [state, setState] = useState(pageData.state);
  const [form, setForm] = useState(() => createDefaultForm(pageData.state));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const groupedBlocks = useMemo(() => groupBlocksByDate(state.blocks), [state]);

  async function createManualBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const result = await actions.createManualBlock({
      ...form,
      fromLocalDate: state.fromLocalDate,
      toLocalDate: state.toLocalDate,
    });

    if (result.ok) {
      setState(result.data.state);
      setForm((current) => ({
        ...current,
        reason: "",
      }));
      setMessage("Manual block created.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
  }

  async function releaseManualBlock(block: AdminCalendarBlock) {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const result = await actions.releaseManualBlock({
      calendarBlockId: block.id,
      fromLocalDate: state.fromLocalDate,
      toLocalDate: state.toLocalDate,
    });

    if (result.ok) {
      setState(result.data.state);
      setMessage("Manual block released.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
  }

  return (
    <AdminShell activeItemId="calendar" navItems={pageData.navItems}>
      <SaveStatus error={error} isSaving={isSaving} message={message} />
      <div className="space-y-5">
        <CalendarHeader state={state} />
        <CalendarRangePanel state={state} />
        <ManualBlockPanel
          form={form}
          isSaving={isSaving}
          onSubmit={createManualBlock}
          setForm={setForm}
        />
        <CalendarBlocksPanel
          groupedBlocks={groupedBlocks}
          isSaving={isSaving}
          releaseManualBlock={releaseManualBlock}
        />
      </div>
    </AdminShell>
  );
}

function CalendarHeader({ state }: { state: AdminCalendarState }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
          Operations
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Boat calendar
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Active blocks protect the only boat from overlapping availability.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[36rem] xl:grid-cols-4">
        <MetricTile label="Active blocks" value={state.summary.activeBlocks} />
        <MetricTile label="Bookings" value={state.summary.bookingBlocks} />
        <MetricTile label="Manual blocks" value={state.summary.manualBlocks} />
        <MetricTile label="Released" value={state.summary.releasedBlocks} />
      </div>
    </div>
  );
}

function CalendarRangePanel({ state }: { state: AdminCalendarState }) {
  return (
    <Surface
      description={`Showing ${formatDateLabel(state.fromLocalDate)} to ${formatDateLabel(
        state.toLocalDate,
      )} in ${state.timeZone}.`}
      title="Calendar range"
    >
      <form action="/admin/calendar" className="space-y-4" method="get">
        <FieldGrid>
          <TextField
            defaultValue={state.fromLocalDate}
            label="From date"
            name="from"
            pattern="\d{4}-\d{2}-\d{2}"
            placeholder="2026-06-05"
          />
          <TextField
            defaultValue={state.toLocalDate}
            label="To date"
            name="to"
            pattern="\d{4}-\d{2}-\d{2}"
            placeholder="2026-06-14"
          />
        </FieldGrid>
        <Button type="submit" variant="secondary">
          <CalendarDays className="size-4" aria-hidden="true" />
          Apply range
        </Button>
      </form>
    </Surface>
  );
}

function ManualBlockPanel({
  form,
  isSaving,
  onSubmit,
  setForm,
}: {
  form: AdminCalendarManualBlockInput;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setForm: (
    updater: (
      current: AdminCalendarManualBlockInput,
    ) => AdminCalendarManualBlockInput,
  ) => void;
}) {
  return (
    <Surface
      description="Create an operational hold that blocks the boat for a concrete local time range."
      title="Create manual block"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FieldGrid columns={3}>
          <TextField
            label="Date"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                localDate: event.target.value,
              }))
            }
            pattern="\d{4}-\d{2}-\d{2}"
            placeholder="2026-06-05"
            value={form.localDate}
          />
          <TextField
            label="Start time"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                startTime: event.target.value,
              }))
            }
            pattern="([01]\d|2[0-3]):[0-5]\d"
            placeholder="10:00"
            value={form.startTime}
          />
          <TextField
            label="End time"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                endTime: event.target.value,
              }))
            }
            pattern="([01]\d|2[0-3]):[0-5]\d"
            placeholder="12:00"
            value={form.endTime}
          />
        </FieldGrid>
        <TextAreaField
          label="Reason"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              reason: event.target.value,
            }))
          }
          placeholder="Maintenance, private owner hold, weather review..."
          value={form.reason}
        />
        <Button disabled={isSaving} loading={isSaving} type="submit">
          <Lock className="size-4" aria-hidden="true" />
          Create block
        </Button>
      </form>
    </Surface>
  );
}

function CalendarBlocksPanel({
  groupedBlocks,
  isSaving,
  releaseManualBlock,
}: {
  groupedBlocks: Array<{ blocks: AdminCalendarBlock[]; localDate: string }>;
  isSaving: boolean;
  releaseManualBlock: (block: AdminCalendarBlock) => Promise<void>;
}) {
  return (
    <Surface
      description="The agenda below is the operational availability lock for the single boat."
      title="Operational blocks"
    >
      {groupedBlocks.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center">
          <p className="text-sm font-semibold text-slate-950">
            No blocks in this range.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Create a manual block to reserve the boat for internal operations.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedBlocks.map((group) => (
            <div className="space-y-3" key={group.localDate}>
              <h2 className="text-sm font-semibold text-slate-950">
                {formatDateLabel(group.localDate)}
              </h2>
              <div className="space-y-3">
                {group.blocks.map((block) => (
                  <CalendarBlockRow
                    block={block}
                    isSaving={isSaving}
                    key={block.id}
                    releaseManualBlock={releaseManualBlock}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Surface>
  );
}

function CalendarBlockRow({
  block,
  isSaving,
  releaseManualBlock,
}: {
  block: AdminCalendarBlock;
  isSaving: boolean;
  releaseManualBlock: (block: AdminCalendarBlock) => Promise<void>;
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={block.status === "active" ? "emerald" : "neutral"}>
              {block.statusLabel}
            </Badge>
            <Badge tone="sky">{block.sourceLabel}</Badge>
          </div>
          <div>
            <p className="flex items-center gap-2 text-base font-semibold text-slate-950">
              <Clock3 className="size-4 shrink-0" aria-hidden="true" />
              <span>
                {block.startTime} - {block.endTime}
              </span>
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {block.reason}
            </p>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Created by {block.createdByUserId}
          </p>
        </div>
        {block.canRelease ? (
          <Button
            disabled={isSaving}
            loading={isSaving}
            onClick={() => releaseManualBlock(block)}
            variant="secondary"
          >
            <Unlock className="size-4" aria-hidden="true" />
            Release
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function SaveStatus({
  error,
  isSaving,
  message,
}: {
  error: string | null;
  isSaving: boolean;
  message: string | null;
}) {
  if (!isSaving && !message && !error) {
    return null;
  }

  return (
    <div
      className="mb-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
      role={error ? "alert" : "status"}
    >
      {error ?? message ?? "Saving calendar..."}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function createDefaultForm(
  state: AdminCalendarState,
): AdminCalendarManualBlockInput {
  return {
    endTime: "12:00",
    fromLocalDate: state.fromLocalDate,
    localDate: state.fromLocalDate,
    reason: "",
    startTime: "10:00",
    toLocalDate: state.toLocalDate,
  };
}

function groupBlocksByDate(blocks: AdminCalendarBlock[]) {
  const groups = new Map<string, AdminCalendarBlock[]>();

  for (const block of blocks) {
    const group = groups.get(block.localDate) ?? [];
    group.push(block);
    groups.set(block.localDate, group);
  }

  return [...groups.entries()]
    .map(([localDate, groupBlocks]) => ({
      blocks: groupBlocks.slice().sort((first, second) => {
        return first.startTime.localeCompare(second.startTime);
      }),
      localDate,
    }))
    .sort((first, second) => first.localDate.localeCompare(second.localDate));
}

function formatDateLabel(localDate: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
  }).format(new Date(`${localDate}T00:00:00.000Z`));
}
