import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  afterEach(() => {
    vi.unstubAllGlobals();
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
        signal: expect.any(AbortSignal),
      }),
    );

    resolveAvailability({
      json: async () => ({ availability }),
      ok: true,
    });

    expect(
      await screen.findByRole("button", {
        name: /select monday june 15, 2026/i,
      }),
    ).toBeVisible();
  });

  it("starts secure checkout with the selected booking details", async () => {
    const user = userEvent.setup();
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
      screen.getByRole("button", { name: /select monday june 15, 2026/i }),
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
        consents: expect.objectContaining({
          ticketEmail: true,
          ticketWhatsapp: true,
        }),
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

  it("renders embedded checkout when Stripe creates a client secret", async () => {
    const user = userEvent.setup();
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
      screen.getByRole("button", { name: /select monday june 15, 2026/i }),
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
      screen.getByRole("button", { name: /select monday june 15, 2026/i }),
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
