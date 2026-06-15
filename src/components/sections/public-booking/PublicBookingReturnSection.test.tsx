import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClientAnalyticsProvider } from "@/components/analytics/ClientAnalytics";
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
    const dictionary = getPublicDictionary("en");

    render(
      <PublicBookingReturnSection
        content={pendingContent}
        dictionary={{
          ...dictionary.returnPage,
          backToJimBoats: dictionary.common.backToJimBoats,
        }}
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

  it("tracks payment return status without private booking data", async () => {
    const track = vi.fn();
    const dictionary = getPublicDictionary("en");

    render(
      <ClientAnalyticsProvider analytics={{ track }}>
        <PublicBookingReturnSection
          content={confirmedContent}
          dictionary={{
            ...dictionary.returnPage,
            backToJimBoats: dictionary.common.backToJimBoats,
          }}
          locale="en"
          sessionId="cs_test_123"
        />
      </ClientAnalyticsProvider>,
    );

    await waitFor(() => {
      expect(track).toHaveBeenCalledWith(
        "booking_success_viewed",
        expect.objectContaining({
          locale: "en",
          status: "CONFIRMED",
        }),
      );
    });
    expect(track).toHaveBeenCalledWith(
      "booking_confirmed",
      expect.objectContaining({
        deposit_amount_minor: 10000,
        locale: "en",
      }),
    );

    const analyticsPayload = JSON.stringify(track.mock.calls);

    expect(analyticsPayload).not.toContain("sailor@example.com");
    expect(analyticsPayload).not.toContain("JB-2026-0001");
    expect(analyticsPayload).not.toContain("cs_test_123");
  });
});

const pendingContent = {
  bookingAccessUrl: null,
  customerEmail: "sailor@example.com",
  experienceTitle: "Sunset Cruise",
  paidDepositAmount: 0,
  reference: "JB-2026-0001",
  remainingAmount: 19000,
  status: "PENDING_PAYMENT",
} satisfies PublicBookingReturnContent;

const confirmedContent = {
  ...pendingContent,
  bookingAccessUrl: null,
  paidDepositAmount: 10000,
  status: "CONFIRMED",
} satisfies PublicBookingReturnContent;
