"use server";

import { ZodError } from "zod";

import { getContainer } from "@/container";
import type {
  AdminBookingActionResult,
  AdminBookingCancelInput,
  AdminBookingCreateInput,
  AdminBookingIssueAccessLinkInput,
  AdminBookingMarkSeenInput,
  AdminBookingUpdateInput,
  AdminBookingsState,
} from "@/components/sections/admin-bookings/AdminBookingTypes";
import { ApplicationError } from "@/shared/application/ApplicationError";
import { DomainError } from "@/shared/domain/DomainError";

import { presentAdminBookingsWorkspace } from "../presenters/adminBookingsPresenter";
import {
  parseAdminBookingCancel,
  parseAdminBookingCreate,
  parseAdminBookingIssueAccessLink,
  parseAdminBookingMarkSeen,
  parseAdminBookingUpdate,
} from "../validators/adminBookingValidators";

const currentAdminUserId = "admin-user";

export async function createAdminBookingAction(
  input: AdminBookingCreateInput,
): Promise<
  AdminBookingActionResult<{
    bookingId: string;
    state: AdminBookingsState;
  }>
> {
  try {
    const commandInput = parseAdminBookingCreate(input);
    const container = getContainer();
    const booking = await container.adminBookings.createBackpanelBooking({
      createdByUserId: currentAdminUserId,
      customer: {
        email: commandInput.customerEmail,
        fullName: commandInput.customerName,
        notes: commandInput.customerNotes,
        phone: commandInput.customerPhone || null,
        preferredLocale: "en",
      },
      endTime: commandInput.endTime,
      experienceId: commandInput.experienceId,
      guestCount: commandInput.guestCount,
      internalNotes: commandInput.internalNotes,
      localDate: commandInput.localDate,
      selectedExtras: commandInput.selectedExtras,
      slotKey: commandInput.slotKey,
      startTime: commandInput.startTime,
    });

    return ok({
      bookingId: booking.id,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function updateAdminBookingAction(
  input: AdminBookingUpdateInput,
): Promise<
  AdminBookingActionResult<{
    bookingId: string;
    state: AdminBookingsState;
  }>
> {
  try {
    const commandInput = parseAdminBookingUpdate(input);
    const container = getContainer();
    const booking = await container.adminBookings.updateBackpanelBooking({
      bookingId: commandInput.bookingId,
      customer: {
        email: commandInput.customerEmail,
        fullName: commandInput.customerName,
        notes: commandInput.customerNotes,
        phone: commandInput.customerPhone || null,
        preferredLocale: "en",
      },
      endTime: commandInput.endTime,
      guestCount: commandInput.guestCount,
      internalNotes: commandInput.internalNotes,
      localDate: commandInput.localDate,
      selectedExtras: commandInput.selectedExtras,
      slotKey: commandInput.slotKey,
      startTime: commandInput.startTime,
      updatedByUserId: currentAdminUserId,
    });

    return ok({
      bookingId: booking.id,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function cancelAdminBookingAction(
  input: AdminBookingCancelInput,
): Promise<
  AdminBookingActionResult<{
    bookingId: string;
    state: AdminBookingsState;
  }>
> {
  try {
    const commandInput = parseAdminBookingCancel(input);
    const container = getContainer();
    const booking = await container.adminBookings.cancelBackpanelBooking({
      bookingId: commandInput.bookingId,
      cancelledByUserId: currentAdminUserId,
    });

    return ok({
      bookingId: booking.id,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function issueAdminBookingAccessLinkAction(
  input: AdminBookingIssueAccessLinkInput,
): Promise<
  AdminBookingActionResult<{
    expiresAt: string;
    url: string;
  }>
> {
  try {
    const commandInput = parseAdminBookingIssueAccessLink(input);
    const issued = await getContainer().adminBookings.issueAccessLink({
      bookingId: commandInput.bookingId,
    });

    return ok(issued);
  } catch (error) {
    return failure(error);
  }
}

export async function markAdminBookingSeenAction(
  input: AdminBookingMarkSeenInput,
): Promise<
  AdminBookingActionResult<{
    bookingId: string;
    state: AdminBookingsState;
  }>
> {
  try {
    const commandInput = parseAdminBookingMarkSeen(input);
    const container = getContainer();
    const result = await container.adminBookings.markSeen({
      bookingId: commandInput.bookingId,
    });

    return ok({
      bookingId: result.bookingId,
      state: await loadState(container),
    });
  } catch (error) {
    return failure(error);
  }
}

async function loadState(container: ReturnType<typeof getContainer>) {
  return presentAdminBookingsWorkspace(
    await container.adminBookings.getWorkspace(),
  );
}

function ok<TData>(data: TData): AdminBookingActionResult<TData> {
  return {
    data,
    ok: true,
  };
}

function failure<TData = never>(error: unknown): AdminBookingActionResult<TData> {
  if (error instanceof ApplicationError || error instanceof DomainError) {
    return {
      message: error.message,
      ok: false,
    };
  }

  if (error instanceof ZodError) {
    return {
      message: error.issues[0]?.message ?? "Invalid admin booking input.",
      ok: false,
    };
  }

  return {
    message: "Unexpected error while saving the booking.",
    ok: false,
  };
}
