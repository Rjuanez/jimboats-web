"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import { AdminBookingCreateSection } from "./AdminBookingCreateSection";
import { AdminBookingDetailSection } from "./AdminBookingDetailSection";
import { AdminBookingsListSection } from "./AdminBookingsListSection";
import type {
  AdminBookingActions,
  AdminBookingCancelInput,
  AdminBookingCreateInput,
  AdminBookingIssueAccessLinkInput,
  AdminBookingMarkSeenInput,
  AdminBookingUpdateInput,
  AdminBookingsPageData,
  AdminBookingView,
} from "./AdminBookingTypes";

type AdminBookingsWorkspaceProps = {
  actions: AdminBookingActions;
  bookingId?: string;
  initialState: AdminBookingsPageData["state"];
  navItems: AdminBookingsPageData["navItems"];
  view: AdminBookingView;
};

export function AdminBookingsWorkspace({
  actions,
  bookingId,
  initialState,
  navItems,
  view,
}: AdminBookingsWorkspaceProps) {
  const [state, setState] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createBooking(input: AdminBookingCreateInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.createBooking(input);

    if (result.ok) {
      setState(result.data.state);
      setMessage("Booking created.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  async function updateBooking(input: AdminBookingUpdateInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.updateBooking(input);

    if (result.ok) {
      setState(result.data.state);
      setMessage("Booking updated.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  async function cancelBooking(input: AdminBookingCancelInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.cancelBooking(input);

    if (result.ok) {
      setState(result.data.state);
      setMessage("Booking cancelled.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  async function issueAccessLink(input: AdminBookingIssueAccessLinkInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.issueAccessLink(input);

    if (result.ok) {
      setMessage("Booking access link generated.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  async function markSeen(input: AdminBookingMarkSeenInput) {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await actions.markSeen(input);

    if (result.ok) {
      setState(result.data.state);
      setMessage("Booking marked as seen.");
    } else {
      setError(result.message);
    }

    setIsSaving(false);
    return result;
  }

  return (
    <AdminShell activeItemId="bookings" navItems={navItems}>
      <SaveStatus error={error} isSaving={isSaving} message={message} />
      {renderView({
        bookingId,
        cancelBooking,
        createBooking,
        isSaving,
        issueAccessLink,
        markSeen,
        state,
        updateBooking,
        view,
      })}
    </AdminShell>
  );
}

function renderView({
  bookingId,
  cancelBooking,
  createBooking,
  isSaving,
  issueAccessLink,
  markSeen,
  state,
  updateBooking,
  view,
}: {
  bookingId?: string;
  cancelBooking: (
    input: AdminBookingCancelInput,
  ) => ReturnType<AdminBookingActions["cancelBooking"]>;
  createBooking: (
    input: AdminBookingCreateInput,
  ) => ReturnType<AdminBookingActions["createBooking"]>;
  isSaving: boolean;
  issueAccessLink: (
    input: AdminBookingIssueAccessLinkInput,
  ) => ReturnType<AdminBookingActions["issueAccessLink"]>;
  markSeen: (
    input: AdminBookingMarkSeenInput,
  ) => ReturnType<AdminBookingActions["markSeen"]>;
  state: AdminBookingsPageData["state"];
  updateBooking: (
    input: AdminBookingUpdateInput,
  ) => ReturnType<AdminBookingActions["updateBooking"]>;
  view: AdminBookingView;
}) {
  if (view === "list") {
    return (
      <AdminBookingsListSection
        isSaving={isSaving}
        markSeen={markSeen}
        state={state}
      />
    );
  }

  if (view === "create") {
    return (
      <AdminBookingCreateSection
        createBooking={createBooking}
        isSaving={isSaving}
        state={state}
      />
    );
  }

  const booking = state.bookings.find((current) => current.id === bookingId);

  if (!booking) {
    return <MissingBooking />;
  }

  return (
    <AdminBookingDetailSection
      booking={booking}
      cancelBooking={cancelBooking}
      isSaving={isSaving}
      issueAccessLink={issueAccessLink}
      state={state}
      updateBooking={updateBooking}
    />
  );
}

function MissingBooking() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">
        Booking not found
      </h1>
      <Surface title="Booking not found">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3 text-slate-700">
            <AlertCircle className="size-5 text-amber-600" aria-hidden="true" />
            <p className="text-sm leading-6">
              This booking does not exist or was changed from another session.
            </p>
          </div>
          <Button href="/admin/bookings" variant="secondary">
            Back to bookings
          </Button>
        </div>
      </Surface>
    </div>
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
      role={error || message ? "alert" : "status"}
    >
      {error ?? message ?? "Saving booking..."}
    </div>
  );
}
