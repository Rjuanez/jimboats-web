import { adminEs } from "@/i18n/admin/es";
import {
  CalendarDays,
  CheckCircle2,
  Plus,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminBooking,
  AdminBookingActions,
  AdminBookingsState,
} from "./AdminBookingTypes";

type AdminBookingsListSectionProps = {
  isSaving: boolean;
  markSeen: AdminBookingActions["markSeen"];
  state: AdminBookingsState;
};

export function AdminBookingsListSection({
  isSaving,
  markSeen,
  state,
}: AdminBookingsListSectionProps) {
  return (
    <div className="space-y-5">
      <BookingsHeader state={state} />
      <Surface
        action={
          <Button href="/admin/bookings/new">
            <Plus className="size-4" aria-hidden="true" />
            {adminEs["New booking"]}
          </Button>
        }
        description={
          adminEs[
            "Operational reservations created from checkout or the backpanel."
          ]
        }
        title={adminEs.allBookings}
      >
        {state.bookings.length === 0 ? (
          <EmptyBookings />
        ) : (
          <div className="grid gap-3">
            {state.bookings.map((booking) => (
              <BookingRow
                booking={booking}
                isSaving={isSaving}
                key={booking.id}
                markSeen={markSeen}
                showQuickAcknowledge={booking.needsAcknowledgement}
              />
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
}

function BookingsHeader({ state }: { state: AdminBookingsState }) {
  return (
    <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
          {adminEs["Operations"]}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          {adminEs["Bookings"]}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {
            adminEs[
              "Manage public and manual reservations, availability and cancellations."
            ]
          }
        </p>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 min-w-0 w-full 2xl:max-w-3xl xl:grid-cols-5">
        <MetricTile
          label={adminEs["Total"]}
          value={state.summary.totalBookings}
        />
        <MetricTile
          label={adminEs["To accept"]}
          value={state.summary.unacknowledgedBookings}
        />
        <MetricTile
          label={adminEs.confirmedBookings}
          value={state.summary.confirmedBookings}
        />
        <MetricTile
          label={adminEs.pendingBookings}
          value={state.summary.pendingPaymentBookings}
        />
        <MetricTile
          label={adminEs.cancelledBookings}
          value={state.summary.cancelledBookings}
        />
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

function BookingRow({
  booking,
  isSaving = false,
  markSeen,
  showQuickAcknowledge = false,
}: {
  booking: AdminBooking;
  isSaving?: boolean;
  markSeen?: AdminBookingActions["markSeen"];
  showQuickAcknowledge?: boolean;
}) {
  async function markCurrentBookingSeen() {
    await markSeen?.({ bookingId: booking.id });
  }

  return (
    <article className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-slate-950">
            {booking.reference}
          </h2>
          <StatusBadge booking={booking} />
          {booking.needsAcknowledgement ? (
            <Badge tone="amber">{adminEs["Not seen"]}</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {booking.experienceSummary}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDate(booking.localDate)} · {booking.startTime}-
            {booking.endTime}
          </span>
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4" aria-hidden="true" />
            {booking.guestCount} {adminEs["guests"]}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-slate-950">
          {booking.customerName}
        </p>
        <p className="mt-1 break-words text-sm text-slate-600">
          {booking.customerEmail}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ReceiptText className="size-4" aria-hidden="true" />
          {adminEs.euros(booking.totalAmount)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        {showQuickAcknowledge ? (
          <Button
            disabled={isSaving}
            onClick={markCurrentBookingSeen}
            variant="primary"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {adminEs["Mark as seen"]}
          </Button>
        ) : null}
        <Button href={`/admin/bookings/${booking.id}`} variant="secondary">
          {adminEs["View detail"]}
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
      <p className="text-sm font-semibold text-slate-950">
        {adminEs["No bookings yet"]}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {
          adminEs[
            "Create the first manual booking from the backpanel to test calendar blocking."
          ]
        }
      </p>
      <div className="mt-4">
        <Button href="/admin/bookings/new">
          <Plus className="size-4" aria-hidden="true" />
          {adminEs["New booking"]}
        </Button>
      </div>
    </div>
  );
}

function formatDate(localDate: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${localDate}T00:00:00.000Z`));
}
