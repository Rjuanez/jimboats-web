import { CalendarDays, Plus, ReceiptText, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type { AdminBooking, AdminBookingsState } from "./AdminBookingTypes";

type AdminBookingsListSectionProps = {
  state: AdminBookingsState;
};

export function AdminBookingsListSection({
  state,
}: AdminBookingsListSectionProps) {
  return (
    <div className="space-y-5">
      <BookingsHeader state={state} />
      <Surface
        action={
          <Button href="/admin/bookings/new">
            <Plus className="size-4" aria-hidden="true" />
            New booking
          </Button>
        }
        description="Operational reservations created from checkout or the backpanel."
        title="Bookings"
      >
        {state.bookings.length === 0 ? (
          <EmptyBookings />
        ) : (
          <div className="grid gap-3">
            {state.bookings.map((booking) => (
              <BookingRow booking={booking} key={booking.id} />
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
}

function BookingsHeader({ state }: { state: AdminBookingsState }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
          Operations
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Bookings
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Create and inspect reservations before checkout is connected to the public site.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[34rem] xl:grid-cols-4">
        <MetricTile label="Total" value={state.summary.totalBookings} />
        <MetricTile label="Confirmed" value={state.summary.confirmedBookings} />
        <MetricTile
          label="Pending"
          value={state.summary.pendingPaymentBookings}
        />
        <MetricTile label="Cancelled" value={state.summary.cancelledBookings} />
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function BookingRow({ booking }: { booking: AdminBooking }) {
  return (
    <article className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-slate-950">
            {booking.reference}
          </h2>
          <StatusBadge booking={booking} />
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {booking.experienceName}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDate(booking.localDate)} · {booking.startTime}-
            {booking.endTime}
          </span>
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4" aria-hidden="true" />
            {booking.guestCount} guests
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">
          {booking.customerName}
        </p>
        <p className="mt-1 truncate text-sm text-slate-600">
          {booking.customerEmail}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ReceiptText className="size-4" aria-hidden="true" />
          EUR {booking.totalAmount}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button href={`/admin/bookings/${booking.id}`} variant="secondary">
          View detail
        </Button>
      </div>
    </article>
  );
}

function StatusBadge({ booking }: { booking: AdminBooking }) {
  if (booking.status === "confirmed") {
    return <Badge tone="emerald">{booking.statusLabel}</Badge>;
  }

  if (booking.status === "cancelled" || booking.status === "payment_failed") {
    return <Badge tone="rose">{booking.statusLabel}</Badge>;
  }

  return <Badge tone="amber">{booking.statusLabel}</Badge>;
}

function EmptyBookings() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
      <p className="text-sm font-semibold text-slate-950">No bookings yet</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        Create the first manual booking from the backpanel to test calendar blocking.
      </p>
      <div className="mt-4">
        <Button href="/admin/bookings/new">
          <Plus className="size-4" aria-hidden="true" />
          New booking
        </Button>
      </div>
    </div>
  );
}

function formatDate(localDate: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${localDate}T00:00:00.000Z`));
}
