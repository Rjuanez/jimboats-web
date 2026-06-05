import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAdminBookingsPreviewPage } from "@/interface/next/presenters/adminBookingsPresenter";

import { AdminBookingsWorkspace } from "./AdminBookingsWorkspace";
import type { AdminBookingActions } from "./AdminBookingTypes";

describe("AdminBookingsWorkspace", () => {
  it("renders booking metrics and list items", () => {
    const pageData = getAdminBookingsPreviewPage();

    render(
      <AdminBookingsWorkspace
        actions={createActions(pageData.state)}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="list"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Bookings" }),
    ).toBeVisible();
    expect(screen.getByText("JB-2026-0001")).toBeVisible();
    expect(screen.getByText("Sailor Guest")).toBeVisible();
  });

  it("renders the booking create form and submits controlled input", async () => {
    const pageData = getAdminBookingsPreviewPage();
    const user = userEvent.setup();
    const actions = createActions(pageData.state);

    render(
      <AdminBookingsWorkspace
        actions={actions}
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="create"
      />,
    );

    await user.type(screen.getByLabelText("Full name"), "Browser Guest");
    await user.type(screen.getByLabelText("Email"), "browser@example.com");
    await user.click(screen.getByRole("button", { name: /create booking/i }));

    expect(actions.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: "browser@example.com",
        customerName: "Browser Guest",
      }),
    );
  });

  it("renders booking detail", () => {
    const pageData = getAdminBookingsPreviewPage();

    render(
      <AdminBookingsWorkspace
        actions={createActions(pageData.state)}
        bookingId="booking-preview-1"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="detail"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "JB-2026-0001" }),
    ).toBeVisible();
    expect(screen.getByText("Payment snapshot")).toBeVisible();
    expect(screen.getByText("Activity")).toBeVisible();
    expect(screen.getByText("Booking was created.")).toBeVisible();
  });

  it("submits booking detail edits", async () => {
    const pageData = getAdminBookingsPreviewPage();
    const user = userEvent.setup();
    const actions = createActions(pageData.state);

    render(
      <AdminBookingsWorkspace
        actions={actions}
        bookingId="booking-preview-1"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="detail"
      />,
    );

    await user.clear(screen.getByLabelText("Full name"));
    await user.type(screen.getByLabelText("Full name"), "Updated Guest");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(actions.updateBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "booking-preview-1",
        customerName: "Updated Guest",
      }),
    );
  });

  it("confirms booking cancellation", async () => {
    const pageData = getAdminBookingsPreviewPage();
    const user = userEvent.setup();
    const actions = createActions(pageData.state);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <AdminBookingsWorkspace
        actions={actions}
        bookingId="booking-preview-1"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="detail"
      />,
    );

    await user.click(screen.getByRole("button", { name: /cancel booking/i }));

    expect(confirm).toHaveBeenCalled();
    expect(actions.cancelBooking).toHaveBeenCalledWith({
      bookingId: "booking-preview-1",
    });

    confirm.mockRestore();
  });

  it("generates a buyer access link from booking detail", async () => {
    const pageData = getAdminBookingsPreviewPage();
    const user = userEvent.setup();
    const actions = createActions(pageData.state);

    render(
      <AdminBookingsWorkspace
        actions={actions}
        bookingId="booking-preview-1"
        initialState={pageData.state}
        navItems={pageData.navItems}
        view="detail"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /generate access link/i }),
    );

    expect(actions.issueAccessLink).toHaveBeenCalledWith({
      bookingId: "booking-preview-1",
    });
    expect(await screen.findByText("https://jimboats.test/access")).toBeVisible();
  });
});

function createActions(
  state: ReturnType<typeof getAdminBookingsPreviewPage>["state"],
): AdminBookingActions {
  return {
    cancelBooking: vi.fn(async () => ({
      data: {
        bookingId: "booking-preview-1",
        state,
      },
      ok: true as const,
    })),
    createBooking: vi.fn(async () => ({
      data: {
        bookingId: "booking-created",
        state,
      },
      ok: true as const,
    })),
    issueAccessLink: vi.fn(async () => ({
      data: {
        expiresAt: "2027-06-05T12:00:00.000Z",
        url: "https://jimboats.test/access",
      },
      ok: true as const,
    })),
    updateBooking: vi.fn(async () => ({
      data: {
        bookingId: "booking-preview-1",
        state,
      },
      ok: true as const,
    })),
  };
}
