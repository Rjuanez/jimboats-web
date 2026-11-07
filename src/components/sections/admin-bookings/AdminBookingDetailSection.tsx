import { adminEs } from "@/i18n/admin/es";
import {
  Copy,
  ExternalLink,
  Link2,
  MessageCircle,
  ReceiptText,
  XCircle,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import { AdminBookingAuditTimeline } from "./AdminBookingAuditTimeline";
import { AdminBookingEditForm } from "./AdminBookingEditForm";
import type {
  AdminBooking,
  AdminBookingActions,
  AdminBookingIssuedAccessLink,
  AdminBookingUpdateInput,
  AdminBookingsState,
} from "./AdminBookingTypes";

type AdminBookingDetailSectionProps = {
  cancelBooking: AdminBookingActions["cancelBooking"];
  booking: AdminBooking;
  issueAccessLink: AdminBookingActions["issueAccessLink"];
  isSaving: boolean;
  state: AdminBookingsState;
  updateBooking: (
    input: AdminBookingUpdateInput,
  ) => ReturnType<AdminBookingActions["updateBooking"]>;
};

export function AdminBookingDetailSection({
  cancelBooking,
  booking,
  issueAccessLink,
  isSaving,
  state,
  updateBooking,
}: AdminBookingDetailSectionProps) {
  const [issuedAccessLink, setIssuedAccessLink] =
    useState<AdminBookingIssuedAccessLink | null>(null);

  async function cancelCurrentBooking() {
    if (window.confirm(adminEs.cancelBookingConfirmation(booking.reference))) {
      await cancelBooking({ bookingId: booking.id });
    }
  }

  async function issueCurrentAccessLink() {
    const result = await issueAccessLink({ bookingId: booking.id });

    if (result.ok) {
      setIssuedAccessLink(result.data);
    }
  }

  async function copyIssuedAccessLink() {
    if (!issuedAccessLink) {
      return;
    }

    await navigator.clipboard?.writeText(issuedAccessLink.url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
            {adminEs["Booking detail"]}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-950">
              {booking.reference}
            </h1>
            <StatusBadge booking={booking} />
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {booking.experienceSummary}
          </p>
          <p className="text-sm leading-6 text-slate-600">
            {formatDate(booking.localDate)} ·{" "}
            {booking.startTime}-{booking.endTime}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isSaving}
            onClick={issueCurrentAccessLink}
            variant="secondary"
          >
            <Link2 className="size-4" aria-hidden="true" />
            {adminEs["Generate access link"]}
          </Button>
          {booking.whatsappEnabled ? (
            <Button
              href={buildWhatsAppUrl(booking)}
              rel="noreferrer"
              target="_blank"
              variant="secondary"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {adminEs["Open WhatsApp"]}
            </Button>
          ) : null}
          <Button
            className="border-rose-200 text-rose-700 hover:bg-rose-50"
            disabled={booking.status !== "confirmed" || isSaving}
            onClick={cancelCurrentBooking}
            variant="secondary"
          >
            <XCircle className="size-4" aria-hidden="true" />
            {adminEs["Cancel booking"]}
          </Button>
          <Button href="/admin/bookings/new" variant="secondary">
            {adminEs["New booking"]}
          </Button>
          <Button href="/admin/bookings" variant="secondary">
            {adminEs["Back to bookings"]}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <AdminBookingEditForm
            booking={booking}
            isSaving={isSaving}
            state={state}
            updateBooking={updateBooking}
          />
        </div>

        <div className="space-y-5">
          <Surface title={adminEs["Payment snapshot"]}>
            <div className="space-y-3">
              <Fact
                icon={<ReceiptText className="size-4" aria-hidden="true" />}
                label={adminEs["Total"]}
                value={adminEs.euros(booking.totalAmount)}
              />
              <Fact
                label={adminEs["Deposit paid"]}
                value={adminEs.euros(booking.depositAmount)}
              />
              <Fact
                label={adminEs["Cash on board"]}
                value={adminEs.euros(booking.remainingAmount)}
              />
            </div>
          </Surface>

          {issuedAccessLink ? (
            <Surface
              description={
                adminEs["Temporary buyer link for viewing this booking."]
              }
              title={adminEs["Buyer access"]}
            >
              <div className="space-y-3">
                <p className="break-all rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                  {issuedAccessLink.url}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {adminEs["Expires"]}{" "}
                  {formatDateTime(issuedAccessLink.expiresAt)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={copyIssuedAccessLink}
                    size="sm"
                    variant="secondary"
                  >
                    <Copy className="size-4" aria-hidden="true" />
                    {adminEs["Copy link"]}
                  </Button>
                  <Button
                    href={issuedAccessLink.url}
                    rel="noreferrer"
                    size="sm"
                    target="_blank"
                    variant="secondary"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                    {adminEs["Open"]}
                  </Button>
                </div>
              </div>
            </Surface>
          ) : null}

          <Surface title={adminEs["Operational acknowledgement"]}>
            <Fact
              label={adminEs["Seen status"]}
              value={
                booking.needsAcknowledgement
                  ? adminEs["Not seen yet"]
                  : booking.operationsSeenLabel
              }
            />
          </Surface>

          <AdminBookingAuditTimeline entries={booking.auditEntries} />
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-950">
        {icon}
        <span className="min-w-0 break-words">{value}</span>
      </p>
    </div>
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

function formatDate(localDate: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${localDate}T00:00:00.000Z`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildWhatsAppUrl(booking: AdminBooking) {
  const phone = booking.whatsappPhone.replace(/\D/g, "");
  const text = [
    `Hola ${booking.customerName},`,
    `tenemos confirmada tu reserva ${booking.reference}`,
    `para ${booking.experienceName}`,
    `el ${formatDate(booking.localDate)} de ${booking.startTime} a ${booking.endTime}`,
    `para ${booking.guestCount} personas.`,
    "Gracias, JimBoats.",
  ].join(" ");

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
