import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getPublicDictionary } from "@/i18n/public";

import {
  PublicBookingReturnSection,
  type PublicBookingReturnContent,
} from "./PublicBookingReturnSection";

describe("PublicBookingReturnSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("waits for a final payment verdict instead of showing pending as a result", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          content: confirmedContent,
          timedOut: false,
        }),
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PublicBookingReturnSection
        content={pendingContent}
        dictionary={getPublicDictionary("en")}
        locale="en"
        sessionId="cs_test_123"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Finalizing your booking" }),
    ).toBeVisible();
    expect(
      screen.queryByText("Payment is being confirmed"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Reference")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Booking confirmed" }),
      ).toBeVisible();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/public-booking/checkout-return/wait?session_id=cs_test_123",
      {
        cache: "no-store",
      },
    );
    expect(screen.getByText("Reference")).toBeVisible();
    expect(screen.getByText("JB-2026-0001")).toBeVisible();
  });
});

const pendingContent = {
  customerEmail: "sailor@example.com",
  experienceTitle: "Sunset Cruise",
  paidDepositAmount: 0,
  reference: "JB-2026-0001",
  remainingAmount: 19000,
  status: "PENDING_PAYMENT",
} satisfies PublicBookingReturnContent;

const confirmedContent = {
  ...pendingContent,
  paidDepositAmount: 10000,
  status: "CONFIRMED",
} satisfies PublicBookingReturnContent;
