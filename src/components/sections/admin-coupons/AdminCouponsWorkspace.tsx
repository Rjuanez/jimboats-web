"use client";

import {
  AlertCircle,
  CircleDollarSign,
  Clock3,
  Copy,
  Download,
  Layers3,
  TicketPercent,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import {
  CheckboxField,
  DateField,
  FieldGrid,
  NumberField,
  SelectField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { AdminShell } from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/design/variants";

import type {
  AdminCoupon,
  AdminCouponActions,
  AdminCouponBatchInput,
  AdminCouponInput,
  AdminCouponsPageData,
  AdminCouponsState,
  AdminCouponView,
} from "./AdminCouponTypes";

type AdminCouponsWorkspaceProps = {
  actions: AdminCouponActions;
  couponId?: string;
  initialState: AdminCouponsPageData["state"];
  navItems: AdminCouponsPageData["navItems"];
  view: AdminCouponView;
};

const emptyCouponInput: AdminCouponInput = {
  campaignName: "Seasonal campaign",
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  experienceIds: [],
  maxTotalRedemptions: null,
  name: "",
  status: "DRAFT",
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: "",
};

const emptyBatchInput: AdminCouponBatchInput = {
  ...emptyCouponInput,
  codePrefix: "SUMMER",
  count: 10,
  namePrefix: "Summer coupon",
};

export function AdminCouponsWorkspace({
  actions,
  couponId,
  initialState,
  navItems,
  view,
}: AdminCouponsWorkspaceProps) {
  const [state, setState] = useState<AdminCouponsState>(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function runMutation<TData extends { state: AdminCouponsState }>(
    mutation: () => Promise<
      | {
          data: TData;
          ok: true;
        }
      | {
          message: string;
          ok: false;
        }
    >,
  ) {
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await mutation();

      if (!result.ok) {
        setMessage(result.message);
        return null;
      }

      setState(result.data.state);
      return result.data;
    } catch {
      setMessage("Unexpected error while saving the coupon.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminShell activeItemId="coupons" navItems={navItems}>
      <SaveStatus isSaving={isSaving} message={message} />
      {renderView({
        actions,
        couponId,
        runMutation,
        state,
        view,
      })}
    </AdminShell>
  );
}

function renderView({
  actions,
  couponId,
  runMutation,
  state,
  view,
}: {
  actions: AdminCouponActions;
  couponId?: string;
  runMutation: <TData extends { state: AdminCouponsState }>(
    mutation: () => Promise<
      | {
          data: TData;
          ok: true;
        }
      | {
          message: string;
          ok: false;
        }
    >,
  ) => Promise<TData | null>;
  state: AdminCouponsState;
  view: AdminCouponView;
}) {
  if (view === "list") {
    return (
      <AdminCouponsList
        actions={actions}
        runMutation={runMutation}
        state={state}
      />
    );
  }

  if (view === "create") {
    return (
      <AdminCouponForm
        experiences={state.experiences}
        mode="create"
        onSubmit={async (coupon) => {
          const result = await runMutation(() => actions.createCoupon(coupon));

          if (result) {
            window.location.assign(`/admin/coupons/${result.couponId}`);
          }
        }}
      />
    );
  }

  const coupon = state.coupons.find((candidate) => candidate.id === couponId);

  if (!coupon) {
    return <MissingCoupon />;
  }

  return (
    <AdminCouponDetail
      actions={actions}
      coupon={coupon}
      experiences={state.experiences}
      runMutation={runMutation}
    />
  );
}

function AdminCouponsList({
  actions,
  runMutation,
  state,
}: {
  actions: AdminCouponActions;
  runMutation: <TData extends { state: AdminCouponsState }>(
    mutation: () => Promise<
      | {
          data: TData;
          ok: true;
        }
      | {
          message: string;
          ok: false;
        }
    >,
  ) => Promise<TData | null>;
  state: AdminCouponsState;
}) {
  const { coupons, metrics } = state;

  return (
    <div className="space-y-5">
      <Header
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                void exportCsv(actions);
              }}
              variant="secondary"
            >
              <Download className="size-4" aria-hidden="true" />
              Export CSV
            </Button>
            <Button href="/admin/coupons/new">New coupon</Button>
          </div>
        }
        eyebrow="Commercial tools"
        title="Coupons"
      />
      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          icon={TicketPercent}
          label="Active coupons"
          value={`${metrics.activeCoupons}/${metrics.totalCoupons}`}
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Discount applied"
          value={formatEuros(metrics.discountAmount)}
        />
        <MetricCard
          icon={Clock3}
          label="Conversion"
          value={`${metrics.conversionRate}%`}
        />
        <MetricCard
          icon={Layers3}
          label="Revenue after discount"
          value={formatEuros(metrics.confirmedRevenueAfterDiscount)}
        />
      </div>
      <AnalyticsGrid state={state} />
      <BatchGenerator
        experiences={state.experiences}
        onSubmit={(batch) =>
          runMutation(() => actions.generateBatch(batch))
        }
      />
      <Surface
        description="Create, pause and inspect tracked discount codes."
        title="Coupon library"
      >
        <div className="grid gap-3">
          {coupons.map((coupon) => (
            <a
              className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 md:grid-cols-[1.2fr_0.8fr_0.7fr_0.5fr]"
              href={`/admin/coupons/${coupon.id}`}
              key={coupon.id}
            >
              <span className="min-w-0">
                <span className="block font-semibold text-slate-950">
                  {coupon.displayCode}
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  {coupon.name}
                </span>
              </span>
              <span className="text-sm text-slate-700">
                {coupon.activeVersion
                  ? discountLabel(coupon.activeVersion)
                  : "No active version"}
              </span>
              <span className="text-sm text-slate-700">
                {coupon.confirmedRedemptions} confirmed
              </span>
              <span className="md:text-right">
                <CouponStatusBadge status={coupon.status} />
              </span>
            </a>
          ))}
          {coupons.length === 0 ? (
            <p className="text-sm text-slate-600">No coupons created yet.</p>
          ) : null}
        </div>
      </Surface>
    </div>
  );
}

function AdminCouponDetail({
  actions,
  coupon,
  experiences,
  runMutation,
}: {
  actions: AdminCouponActions;
  coupon: AdminCoupon;
  experiences: AdminCouponsState["experiences"];
  runMutation: <TData extends { state: AdminCouponsState }>(
    mutation: () => Promise<
      | {
          data: TData;
          ok: true;
        }
      | {
          message: string;
          ok: false;
        }
    >,
  ) => Promise<TData | null>;
}) {
  return (
    <div className="space-y-5">
      <Header
        action={
          <div className="flex flex-wrap gap-2">
            <DuplicateCouponButton
              coupon={coupon}
              duplicateCoupon={(newCode) =>
                runMutation(() =>
                  actions.duplicateCoupon({
                    couponId: coupon.id,
                    newCode,
                  }),
                )
              }
            />
            <Button href="/admin/coupons" variant="secondary">
              Back
            </Button>
          </div>
        }
        eyebrow={coupon.displayCode}
        title={coupon.name}
      />
      <Surface title="Status">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CouponStatusBadge status={coupon.status} />
            <p className="text-sm text-slate-600">
              Updated {coupon.updatedAt}. {coupon.confirmedRedemptions} confirmed
              redemptions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["ACTIVE", "PAUSED", "DRAFT", "EXPIRED"] as const).map((status) => (
              <Button
                disabled={coupon.status === status}
                key={status}
                onClick={() =>
                  void runMutation(() =>
                    actions.changeStatus({
                      couponId: coupon.id,
                      status,
                    }),
                  )
                }
                size="sm"
                variant={status === "ACTIVE" ? "primary" : "secondary"}
              >
                {statusLabel(status)}
              </Button>
            ))}
          </div>
        </div>
      </Surface>
      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          icon={TicketPercent}
          label="Confirmed"
          value={String(coupon.confirmedRedemptions)}
        />
        <MetricCard
          icon={Clock3}
          label="Reserved"
          value={String(coupon.reservedRedemptions)}
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Discount applied"
          value={formatEuros(
            coupon.redemptions
              .filter((redemption) => redemption.status === "CONFIRMED")
              .reduce((sum, redemption) => sum + redemption.discountAmount, 0),
          )}
        />
        <MetricCard
          icon={Layers3}
          label="Revenue"
          value={formatEuros(
            coupon.redemptions
              .filter((redemption) => redemption.status === "CONFIRMED")
              .reduce((sum, redemption) => sum + redemption.finalTotalAmount, 0),
          )}
        />
      </div>
      <AdminCouponForm
        coupon={coupon}
        experiences={experiences}
        mode="edit"
        onSubmit={(input) =>
          runMutation(() =>
            actions.updateCoupon({
              coupon: input,
              couponId: coupon.id,
            }),
          )
        }
      />
      <DetailGrid coupon={coupon} experiences={experiences} />
    </div>
  );
}

function AnalyticsGrid({ state }: { state: AdminCouponsState }) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Surface title="Top coupons">
        <div className="space-y-3">
          {state.ranking.map((item) => (
            <a
              className="block rounded-md border border-slate-200 p-3 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              href={`/admin/coupons/${item.id}`}
              key={item.id}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-slate-950">{item.code}</span>
                <span className="text-sm text-slate-600">
                  {item.confirmedRedemptions} confirmed
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {formatEuros(item.discountAmount)} discounted ·{" "}
                {formatEuros(item.revenueAfterDiscount)} revenue
              </p>
            </a>
          ))}
        </div>
      </Surface>
      <Surface title="Campaigns">
        <div className="space-y-3">
          {state.campaigns.map((campaign) => (
            <div
              className="rounded-md border border-slate-200 p-3"
              key={campaign.campaignName}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-slate-950">
                  {campaign.campaignName}
                </span>
                <span className="text-sm text-slate-600">
                  {campaign.couponCount} codes
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {campaign.confirmedRedemptions} confirmed ·{" "}
                {formatEuros(campaign.discountAmount)} discounted
              </p>
            </div>
          ))}
        </div>
      </Surface>
      <Surface title="Recent usage">
        <div className="space-y-3">
          {state.usage.map((point) => (
            <div className="rounded-md border border-slate-200 p-3" key={point.date}>
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-slate-950">{point.date}</span>
                <span className="text-sm text-slate-600">
                  {formatEuros(point.discountAmount)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {point.confirmed} confirmed · {point.reserved} reserved ·{" "}
                {point.released} released
              </p>
            </div>
          ))}
          {state.usage.length === 0 ? (
            <p className="text-sm text-slate-600">No usage yet.</p>
          ) : null}
        </div>
      </Surface>
    </div>
  );
}

function BatchGenerator({
  experiences,
  onSubmit,
}: {
  experiences: AdminCouponsState["experiences"];
  onSubmit: (input: AdminCouponBatchInput) => Promise<unknown> | unknown;
}) {
  const [input, setInput] = useState<AdminCouponBatchInput>(emptyBatchInput);
  const selectedExperienceIds = new Set(input.experienceIds);

  return (
    <Surface
      description="Generate multiple trackable codes with shared campaign rules."
      title="Batch generator"
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(input);
        }}
      >
        <FieldGrid>
          <TextField
            label="Code prefix"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                codePrefix: event.target.value,
              }))
            }
            value={input.codePrefix}
          />
          <TextField
            label="Name prefix"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                namePrefix: event.target.value,
              }))
            }
            value={input.namePrefix}
          />
          <TextField
            label="Campaign"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                campaignName: event.target.value,
              }))
            }
            value={input.campaignName}
          />
          <NumberField
            label="Quantity"
            max={100}
            min={1}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                count: Number(event.target.value),
              }))
            }
            value={input.count}
          />
          <SelectField
            label="Discount type"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                discountType: event.target
                  .value as AdminCouponInput["discountType"],
              }))
            }
            value={input.discountType}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
          </SelectField>
          <NumberField
            label={input.discountType === "PERCENTAGE" ? "Percent" : "Amount"}
            min={0}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                discountValue: Number(event.target.value),
              }))
            }
            value={input.discountValue}
          />
          <DateField
            label="Valid from"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                validFrom: event.target.value,
              }))
            }
            value={input.validFrom}
          />
          <DateField
            label="Valid until"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                validUntil: event.target.value,
              }))
            }
            value={input.validUntil}
          />
        </FieldGrid>
        <div className="grid gap-3 md:grid-cols-2">
          {experiences.map((experience) => (
            <CheckboxField
              checked={selectedExperienceIds.has(experience.id)}
              description={experience.status}
              key={experience.id}
              label={experience.name}
              onChange={(event) =>
                setInput((current) => {
                  const next = new Set(current.experienceIds);

                  if (event.target.checked) {
                    next.add(experience.id);
                  } else {
                    next.delete(experience.id);
                  }

                  return {
                    ...current,
                    experienceIds: [...next],
                  };
                })
              }
            />
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="submit">
            <Layers3 className="size-4" aria-hidden="true" />
            Generate batch
          </Button>
        </div>
      </form>
    </Surface>
  );
}

function DuplicateCouponButton({
  coupon,
  duplicateCoupon,
}: {
  coupon: AdminCoupon;
  duplicateCoupon: (newCode: string) => Promise<unknown>;
}) {
  const [newCode, setNewCode] = useState(`${coupon.displayCode}-COPY`);

  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        void duplicateCoupon(newCode);
      }}
    >
      <label className="sr-only" htmlFor="duplicate-coupon-code">
        New coupon code
      </label>
      <input
        className="min-h-9 w-40 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        id="duplicate-coupon-code"
        onChange={(event) => setNewCode(event.target.value)}
        value={newCode}
      />
      <Button type="submit" variant="secondary">
        <Copy className="size-4" aria-hidden="true" />
        Duplicate
      </Button>
    </form>
  );
}

async function exportCsv(actions: AdminCouponActions) {
  const result = await actions.exportCsv();

  if (!result.ok) {
    return;
  }

  const blob = new Blob([result.data.csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "jimboats-coupons.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function AdminCouponForm({
  coupon,
  experiences,
  mode,
  onSubmit,
}: {
  coupon?: AdminCoupon;
  experiences: AdminCouponsState["experiences"];
  mode: "create" | "edit";
  onSubmit: (input: AdminCouponInput) => Promise<unknown> | unknown;
}) {
  const initialInput = useMemo(() => inputFromCoupon(coupon), [coupon]);
  const [input, setInput] = useState<AdminCouponInput>(initialInput);
  const selectedExperienceIds = new Set(input.experienceIds);

  return (
    <Surface
      description="Rule changes create a new version so historical redemptions remain traceable."
      title={mode === "create" ? "Create coupon" : "Coupon rules"}
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(input);
        }}
      >
        <FieldGrid>
          <TextField
            disabled={mode === "edit"}
            label="Code"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                code: event.target.value,
              }))
            }
            placeholder="TEST10"
            value={input.code}
          />
          <TextField
            label="Internal name"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            value={input.name}
          />
          <TextField
            label="Campaign"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                campaignName: event.target.value,
              }))
            }
            value={input.campaignName}
          />
          <SelectField
            label="Status"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                status: event.target.value as AdminCouponInput["status"],
              }))
            }
            value={input.status}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
          </SelectField>
        </FieldGrid>

        <FieldGrid>
          <SelectField
            label="Discount type"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                discountType: event.target
                  .value as AdminCouponInput["discountType"],
                discountValue:
                  event.target.value === "PERCENTAGE"
                    ? Math.min(current.discountValue || 10, 100)
                    : current.discountValue,
              }))
            }
            value={input.discountType}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount</option>
          </SelectField>
          <NumberField
            label={input.discountType === "PERCENTAGE" ? "Percent" : "Amount"}
            min={0}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                discountValue: Number(event.target.value),
              }))
            }
            step={input.discountType === "PERCENTAGE" ? 0.01 : 1}
            value={input.discountValue}
          />
          <DateField
            label="Valid from"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                validFrom: event.target.value,
              }))
            }
            value={input.validFrom}
          />
          <DateField
            label="Valid until"
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                validUntil: event.target.value,
              }))
            }
            value={input.validUntil}
          />
          <NumberField
            label="Total usage limit"
            min={1}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                maxTotalRedemptions: event.target.value
                  ? Number(event.target.value)
                  : null,
              }))
            }
            placeholder="Unlimited"
            value={input.maxTotalRedemptions ?? ""}
          />
        </FieldGrid>

        <div>
          <h3 className="text-sm font-semibold text-slate-950">
            Experience limits
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Leave all unchecked to allow this coupon on every experience.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {experiences.map((experience) => (
              <CheckboxField
                checked={selectedExperienceIds.has(experience.id)}
                description={experience.status}
                key={experience.id}
                label={experience.name}
                onChange={(event) =>
                  setInput((current) => {
                    const next = new Set(current.experienceIds);

                    if (event.target.checked) {
                      next.add(experience.id);
                    } else {
                      next.delete(experience.id);
                    }

                    return {
                      ...current,
                      experienceIds: [...next],
                    };
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            {mode === "create" ? "Create coupon" : "Save coupon"}
          </Button>
        </div>
      </form>
    </Surface>
  );
}

function DetailGrid({
  coupon,
  experiences,
}: {
  coupon: AdminCoupon;
  experiences: AdminCouponsState["experiences"];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Surface title="Versions">
        <div className="space-y-3">
          {coupon.versions.map((version) => (
            <div
              className="rounded-md border border-slate-200 p-3"
              key={version.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">
                    Version {version.versionNumber}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {discountLabel(version)} · {version.validFrom}
                    {version.validUntil ? ` to ${version.validUntil}` : ""}
                  </p>
                </div>
        <Badge tone={version.status === "ACTIVE" ? "emerald" : "neutral"}>
                  {version.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {experienceSummary(version.experienceIds, experiences)}
              </p>
            </div>
          ))}
        </div>
      </Surface>

      <Surface title="Recent redemptions">
        <div className="space-y-3">
          {coupon.redemptions.map((redemption) => (
            <div className="rounded-md border border-slate-200 p-3" key={redemption.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">
                    {redemption.customerEmailNormalized}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {redemption.reservedAt} · Booking {redemption.bookingId}
                  </p>
                </div>
                <Badge
                  tone={redemption.status === "CONFIRMED" ? "emerald" : "neutral"}
                >
                  {redemption.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Discount {formatEuros(redemption.discountAmount)} · Final total{" "}
                {formatEuros(redemption.finalTotalAmount)}
              </p>
            </div>
          ))}
          {coupon.redemptions.length === 0 ? (
            <p className="text-sm text-slate-600">No redemptions yet.</p>
          ) : null}
        </div>
      </Surface>

      <Surface className="xl:col-span-2" title="Audit trail">
        <div className="grid gap-3 md:grid-cols-2">
          {coupon.events.map((event) => (
            <div className="rounded-md border border-slate-200 p-3" key={event.id}>
              <p className="font-semibold text-slate-950">{event.label}</p>
              <p className="mt-1 text-sm text-slate-600">
                {event.occurredAt} · {event.actorType}
                {event.actorId ? ` (${event.actorId})` : ""}
              </p>
              {event.bookingId ? (
                <p className="mt-1 text-xs text-slate-500">
                  Booking {event.bookingId}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}

function Header({
  action,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h1>
      </div>
      {action}
    </div>
  );
}

function MissingCoupon() {
  return (
    <Surface title="Coupon not found">
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-3 text-slate-700">
          <AlertCircle className="size-5 text-amber-600" aria-hidden="true" />
          <p className="text-sm leading-6">
            This coupon does not exist or was changed from another session.
          </p>
        </div>
        <Button href="/admin/coupons" variant="secondary">
          Back to coupons
        </Button>
      </div>
    </Surface>
  );
}

function SaveStatus({
  isSaving,
  message,
}: {
  isSaving: boolean;
  message: string | null;
}) {
  if (!isSaving && !message) {
    return null;
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-md border px-4 py-3 text-sm font-semibold shadow-sm",
        message
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-slate-200 bg-white text-slate-700",
      )}
      role={message ? "alert" : "status"}
    >
      {message ?? "Saving coupon..."}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Surface ariaLabel={label}>
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-2xl font-semibold text-slate-950">
            {value}
          </span>
          <span className="text-sm text-slate-600">{label}</span>
        </span>
      </div>
    </Surface>
  );
}

function CouponStatusBadge({ status }: { status: AdminCoupon["status"] }) {
  const tone =
    status === "ACTIVE"
      ? "emerald"
      : status === "PAUSED"
        ? "amber"
        : "neutral";

  return <Badge tone={tone}>{statusLabel(status)}</Badge>;
}

function statusLabel(status: AdminCoupon["status"]) {
  const labels = {
    ACTIVE: "Active",
    DRAFT: "Draft",
    EXPIRED: "Expired",
    PAUSED: "Paused",
  };

  return labels[status];
}

function inputFromCoupon(coupon?: AdminCoupon): AdminCouponInput {
  if (!coupon) {
    return emptyCouponInput;
  }

  const version = coupon.activeVersion;

  return {
    campaignName: coupon.campaignName,
    code: coupon.displayCode,
    discountType: version?.discountType ?? "PERCENTAGE",
    discountValue: version?.discountValue ?? 10,
    experienceIds: version?.experienceIds ?? [],
    maxTotalRedemptions: version?.maxTotalRedemptions ?? null,
    name: coupon.name,
    status: coupon.status,
    validFrom: version?.validFrom ?? emptyCouponInput.validFrom,
    validUntil: version?.validUntil ?? "",
  };
}

function discountLabel(version: AdminCoupon["versions"][number]) {
  if (version.discountType === "PERCENTAGE") {
    return `${version.discountValue}% off`;
  }

  return `${formatEuros(version.discountValue)} off`;
}

function experienceSummary(
  experienceIds: string[],
  experiences: AdminCouponsState["experiences"],
) {
  if (experienceIds.length === 0) {
    return "All experiences";
  }

  const names = experienceIds.map((id) => {
    return experiences.find((experience) => experience.id === id)?.name ?? id;
  });

  return names.join(", ");
}

function formatEuros(amount: number) {
  return new Intl.NumberFormat("en", {
    currency: "EUR",
    style: "currency",
  }).format(amount);
}
