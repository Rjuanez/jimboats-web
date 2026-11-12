import { StrictMode } from "react";
import { HourlyPublicBookingWorkspace } from "./HourlyPublicBookingWorkspace";
import { bookingAvailabilityClient } from "./bookingAvailabilityClient";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClientAnalyticsProvider } from "@/components/analytics/ClientAnalytics";
import { getPublicBookingMockPage } from "@/interface/next/presenters/publicBookingMockPresenter";

import { PublicBookingWorkspace } from "./PublicBookingWorkspace";
import type { PublicBookingActions } from "./PublicBookingTypes";

const { prefetch } = vi.hoisted(() => ({
  prefetch: vi.fn(),
}));

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() =>
    Promise.resolve({
      createEmbeddedCheckoutPage: vi.fn(async () => ({
        destroy: vi.fn(),
        mount: (selector: string) => {
          const target = document.querySelector(selector);

          if (target) {
            target.textContent = "Embedded Stripe Checkout";
          }
        },
        unmount: vi.fn(),
      })),
    }),
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/book",
  useRouter: () => ({
    prefetch,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("PublicBookingWorkspace", () => {
  it("shares the initial request across re-renders and loads months only on navigation", async () => {
    const user = userEvent.setup();
    const mock = getPublicBookingMockPage();
    const base = mock.availabilityByExperienceId["sunset-cruise"];
    const june = {
      ...base,
      calendar: {
        ...base.calendar,
        monthRange: { first: "2026-06", last: "2026-07" },
        months: [
          { id: "2026-06", monthLabel: "June 2026", days: base.calendar.days },
        ],
      },
    };
    const july = {
      ...base,
      calendar: {
        ...base.calendar,
        days: [],
        monthLabel: "July 2026",
        monthRange: { first: "2026-06", last: "2026-07" },
        months: [{ id: "2026-07", monthLabel: "July 2026", days: [] }],
      },
      timeSlotsByDate: {},
    };
    let finish!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      finish = resolve;
    });
    const fetchAvailability = vi
      .fn()
      .mockReturnValueOnce(pending)
      .mockImplementation(async (url: string) => ({
        ok: true,
        json: async () => ({
          availability: url.includes("2026-07") ? july : june,
        }),
      }));
    vi.stubGlobal("fetch", fetchAvailability);
    const content = {
      ...mock,
      experiences: mock.experiences.filter((e) => e.id === "sunset-cruise"),
      availabilityByExperienceId: {},
      hourly: {
        hours: 2,
        rates: [
          { hours: 2, price: 200, depositAmount: 50 },
          { hours: 3, price: 290, depositAmount: 50 },
        ],
        title: "Duration and date",
        durationLabel: "Duration",
      },
    };
    const view = render(
      <StrictMode>
        <HourlyPublicBookingWorkspace
          content={content}
          actions={createActions()}
          stripePublishableKey="pk_test_component"
        />
      </StrictMode>,
    );
    view.rerender(
      <StrictMode>
        <HourlyPublicBookingWorkspace
          content={{ ...content, hourly: { ...content.hourly } }}
          actions={createActions()}
          stripePublishableKey="pk_test_component"
        />
      </StrictMode>,
    );
    expect(fetchAvailability).toHaveBeenCalledTimes(1);
    expect(fetchAvailability.mock.calls[0][0]).toContain(
      "&hours=2&month=current",
    );
    await act(async () => {
      finish({ ok: true, json: async () => ({ availability: june }) });
    });
    await screen.findByRole("button", { name: /monday june 15, 2026/i });
    await user.click(screen.getByRole("button", { name: "Next month" }));
    await screen.findByText("July 2026");
    expect(fetchAvailability).toHaveBeenCalledTimes(2);
    expect(fetchAvailability.mock.calls[1][0]).toContain("&month=2026-07");
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await screen.findByRole("button", { name: /monday june 15, 2026/i });
    expect(fetchAvailability).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("button", { name: "3 h" }));
    await screen.findByRole("button", { name: /monday june 15, 2026/i });
    expect(fetchAvailability).toHaveBeenCalledTimes(3);
    expect(fetchAvailability.mock.calls[2][0]).toContain(
      "&hours=3&month=2026-06",
    );
    await user.click(screen.getByRole("button", { name: "2 h" }));
    await screen.findByRole("button", { name: /monday june 15, 2026/i });
    expect(fetchAvailability).toHaveBeenCalledTimes(3);
  });

  it("lets the customer choose the discounted total instead of a deposit", async () => {
    const user = userEvent.setup();
    stubAvailabilityRefresh();
    const actions = createActions();
    render(
      <PublicBookingWorkspace
        actions={actions}
        content={getPublicBookingMockPage()}
        stripePublishableKey="pk_test_component"
      />,
    );
    await user.click(screen.getByRole("button", { name: /sunset cruise/i }));
    await user.click(
      screen.getByRole("button", { name: /monday june 15, 2026/i }),
    );
    await user.click(screen.getByRole("button", { name: "18:30" }));
    await user.click(
      screen.getByRole("button", { name: /continue to extras/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /continue to payment/i }),
    );
    await user.type(screen.getByLabelText("Full name"), "Full Payment Guest");
    await user.type(screen.getByLabelText("Email address"), "full@test.com");
    await user.click(screen.getByRole("radio", { name: /pay in full now/i }));
    expect(
      screen.getByRole("radio", { name: /pay in full now/i }),
    ).toBeChecked();
    await user.type(screen.getByRole("textbox", { name: /coupon/i }), "TEST10");
    await user.click(screen.getByRole("button", { name: /apply/i }));
    await user.click(
      screen.getByRole("button", { name: /secure payment €261/i }),
    );
    expect(actions.startCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ paymentChoice: "FULL", couponCode: "TEST10" }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    bookingAvailabilityClient.clear();
  });

  it("preselects the requested experience", () => {
    render(
      <PublicBookingWorkspace
        actions={createActions()}
        content={getPublicBookingMockPage()}
        initialExperienceId="morning-breeze"
        stripePublishableKey="pk_test_component"
      />,
    );

    expect(screen.getByRole("img", { name: "JimBoats Charter" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: /morning breeze/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: /select date/i })).toBeVisible();
  });

  it("loads availability after selecting an experience", async () => {
    const user = userEvent.setup();
    const content = getPublicBookingMockPage();
    const availability = content.availabilityByExperienceId["sunset-cruise"];
    let resolveAvailability!: (response: {
      json: () => Promise<{ availability: typeof availability }>;
      ok: boolean;
    }) => void;
    const availabilityRequest = new Promise<{
      json: () => Promise<{ availability: typeof availability }>;
      ok: boolean;
    }>((resolve) => {
      resolveAvailability = resolve;
    });
    const fetchAvailability = vi.fn().mockReturnValue(availabilityRequest);

    vi.stubGlobal("fetch", fetchAvailability);

    render(
      <PublicBookingWorkspace
        actions={createActions()}
        content={{
          ...content,
          availabilityByExperienceId: {},
          calendar: {
            ...content.calendar,
            days: [],
            months: [],
          },
          timeSlots: [],
        }}
        stripePublishableKey="pk_test_component"
      />,
    );

    await user.click(screen.getByRole("button", { name: /sunset cruise/i }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading available dates",
    );
    expect(fetchAvailability).toHaveBeenCalledWith(
      "/api/public-booking/availability?locale=en&experienceId=sunset-cruise",
      expect.objectContaining({
        cache: "no-store",
      }),
    );

    resolveAvailability({
      json: async () => ({ availability }),
      ok: true,
    });

    expect(
      await screen.findByRole("button", {
        name: /monday june 15, 2026/i,
      }),
    ).toBeVisible();
  });

  it("starts secure checkout with the selected booking details", async () => {
    const user = userEvent.setup();
    stubAvailabilityRefresh();
    const actions = createActions({
      message: "Stripe is unavailable in this test.",
      ok: false,
    });

    render(
      <PublicBookingWorkspace
        actions={actions}
        content={getPublicBookingMockPage()}
        stripePublishableKey="pk_test_component"
      />,
    );

    await user.click(screen.getByRole("button", { name: /sunset cruise/i }));
    await user.click(
      screen.getByRole("button", { name: /monday june 15, 2026/i }),
    );
    await user.click(screen.getByRole("button", { name: "18:30" }));
    await user.click(
      screen.getByRole("button", { name: /continue to extras/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Make it yours" }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: /mediterranean drinks/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /continue to payment/i }),
    );

    await user.type(screen.getByLabelText("Full name"), "Sailor Guest");
    await user.type(screen.getByLabelText("Email address"), "sailor@test.com");
    expect(
      within(
        screen.getByRole("region", {
          name: "Your data and your booking",
        }),
      ).getByRole("link", { name: "Privacy policy" }),
    ).toHaveAttribute("href", "/en/privacy");
    expect(
      screen
        .getAllByRole("link", { name: /^Booking terms$/ })
        .find((link) => link.getAttribute("target") === "_blank"),
    ).toHaveAttribute("href", "/en/booking-terms");
    expect(
      screen.queryByRole("checkbox", { name: /promotions/i }),
    ).not.toBeInTheDocument();
    await user.type(
      screen.getByRole("textbox", { name: /^phone/i }),
      "+34 600 000 000",
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: /send the booking pass by whatsapp/i,
      }),
    );
    await user.click(
      screen.getByRole("button", { name: /secure payment €100/i }),
    );

    expect(actions.startCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        consents: {
          ticketEmail: true,
          ticketWhatsapp: true,
        },
        customer: {
          email: "sailor@test.com",
          fullName: "Sailor Guest",
          phone: "+34 600 000 000",
        },
        experienceId: "sunset-cruise",
        guestCount: 1,
        localDate: "2026-06-15",
        locale: "en",
        selectedExtras: [
          {
            extraId: "mediterranean-drinks",
            quantity: 1,
          },
        ],
        startTime: "18:30",
      }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Stripe is unavailable",
    );
  });

  it("tracks booking funnel events without private customer or payment data", async () => {
    const user = userEvent.setup();
    stubAvailabilityRefresh();
    const actions = createActions();
    const track = vi.fn();

    render(
      <ClientAnalyticsProvider analytics={{ track }}>
        <PublicBookingWorkspace
          actions={actions}
          content={getPublicBookingMockPage()}
          stripePublishableKey="pk_test_component"
        />
      </ClientAnalyticsProvider>,
    );

    await user.click(screen.getByRole("button", { name: /sunset cruise/i }));
    await user.click(
      screen.getByRole("button", { name: /monday june 15, 2026/i }),
    );
    await user.click(screen.getByRole("button", { name: "18:30" }));
    await user.click(
      screen.getByRole("button", { name: /continue to extras/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /mediterranean drinks/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /continue to payment/i }),
    );
    await user.type(screen.getByLabelText("Full name"), "Sailor Guest");
    await user.type(screen.getByLabelText("Email address"), "sailor@test.com");
    await user.type(
      screen.getByRole("textbox", { name: /^phone/i }),
      "+34 600 000 000",
    );
    await user.click(
      screen.getByRole("button", { name: /secure payment €100/i }),
    );

    expect(track).toHaveBeenCalledWith(
      "booking_experience_selected",
      expect.objectContaining({
        experience_id: "sunset-cruise",
      }),
    );
    expect(track).toHaveBeenCalledWith(
      "booking_checkout_started",
      expect.objectContaining({
        delivery_email_enabled: true,
        experience_id: "sunset-cruise",
        extras_count: 1,
      }),
    );
    expect(track).toHaveBeenCalledWith(
      "booking_checkout_ready",
      expect.objectContaining({
        experience_id: "sunset-cruise",
      }),
    );

    const analyticsPayload = JSON.stringify(track.mock.calls);

    expect(analyticsPayload).not.toContain("Sailor Guest");
    expect(analyticsPayload).not.toContain("sailor@test.com");
    expect(analyticsPayload).not.toContain("+34 600 000 000");
    expect(analyticsPayload).not.toContain("cs_test_123");
    expect(analyticsPayload).not.toContain("marketing_consent_enabled");
  });

  it("continues after selecting a date in a later calendar month", async () => {
    const user = userEvent.setup();
    const content = getPublicBookingMockPage();
    const sunsetAvailability =
      content.availabilityByExperienceId["sunset-cruise"];
    const julyDate = {
      ariaLabel: "Wednesday July 1, 2026",
      dateLabel: "Jul 1",
      dayLabel: "1",
      id: "2026-07-01",
    };
    const availability = {
      ...sunsetAvailability,
      calendar: {
        ...sunsetAvailability.calendar,
        months: [
          ...(sunsetAvailability.calendar.months ?? []),
          {
            days: [julyDate],
            id: "2026-07",
            monthLabel: "July 2026",
          },
        ],
      },
      timeSlotsByDate: {
        ...sunsetAvailability.timeSlotsByDate,
        "2026-07-01": sunsetAvailability.timeSlotsByDate["2026-06-15"] ?? [],
      },
    };

    render(
      <PublicBookingWorkspace
        actions={createActions()}
        content={{
          ...content,
          availabilityByExperienceId: {
            ...content.availabilityByExperienceId,
            "sunset-cruise": availability,
          },
        }}
        stripePublishableKey="pk_test_component"
      />,
    );

    await user.click(screen.getByRole("button", { name: /sunset cruise/i }));
    await user.click(screen.getByRole("button", { name: /next month/i }));
    await user.click(
      screen.getByRole("button", { name: /wednesday july 1, 2026/i }),
    );
    await user.click(screen.getByRole("button", { name: "18:30" }));

    expect(
      screen.getByRole("button", { name: /continue to extras/i }),
    ).toBeEnabled();
  });

  it("renders embedded checkout when Stripe creates a client secret", async () => {
    const user = userEvent.setup();
    stubAvailabilityRefresh();
    const actions = createActions();

    render(
      <PublicBookingWorkspace
        actions={actions}
        content={getPublicBookingMockPage()}
        stripePublishableKey="pk_test_component"
      />,
    );

    await user.click(screen.getByRole("button", { name: /sunset cruise/i }));
    await user.click(
      screen.getByRole("button", { name: /monday june 15, 2026/i }),
    );
    await user.click(screen.getByRole("button", { name: "18:30" }));
    await user.click(
      screen.getByRole("button", { name: /continue to extras/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /continue to payment/i }),
    );
    await user.type(screen.getByLabelText("Full name"), "Sailor Guest");
    await user.type(screen.getByLabelText("Email address"), "sailor@test.com");
    await user.click(
      screen.getByRole("button", { name: /secure payment €100/i }),
    );

    expect(await screen.findByText("Embedded Stripe Checkout")).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Your Details" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Booking Pass" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /secure payment €100/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("requires at least one booking pass delivery channel", async () => {
    const user = userEvent.setup();

    render(
      <PublicBookingWorkspace
        actions={createActions()}
        content={getPublicBookingMockPage()}
        stripePublishableKey="pk_test_component"
      />,
    );

    await user.click(screen.getByRole("button", { name: /sunset cruise/i }));
    await user.click(
      screen.getByRole("button", { name: /monday june 15, 2026/i }),
    );
    await user.click(screen.getByRole("button", { name: "18:30" }));
    await user.click(
      screen.getByRole("button", { name: /continue to extras/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /continue to payment/i }),
    );
    await user.type(screen.getByLabelText("Full name"), "Sailor Guest");
    await user.type(screen.getByLabelText("Email address"), "sailor@test.com");
    await user.click(
      screen.getByRole("checkbox", { name: /email me the booking pass/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /secure payment €100/i }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose at least one channel",
    );
  });
});

function stubAvailabilityRefresh() {
  const content = getPublicBookingMockPage();

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      json: async () => ({
        availability: content.availabilityByExperienceId["sunset-cruise"],
      }),
      ok: true,
    })),
  );
}

function createActions(
  result: Awaited<ReturnType<PublicBookingActions["startCheckout"]>> = {
    data: {
      checkoutClientSecret: "cs_test_embedded_secret",
      paymentProviderSessionId: "cs_test_123",
    },
    ok: true as const,
  },
): PublicBookingActions {
  return {
    previewCoupon: vi.fn().mockResolvedValue({
      data: {
        code: "TEST10",
        depositAmount: 100,
        discountAmount: 29,
        remainingAmount: 161,
        totalAmount: 261,
      },
      ok: true,
    }),
    startCheckout: vi.fn().mockResolvedValue(result),
  };
}
