import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClientAnalyticsProvider } from "./ClientAnalytics";
import { PublicAnalyticsRouteEvents } from "./PublicAnalyticsRouteEvents";

describe("PublicAnalyticsRouteEvents", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("tracks route views with browser and campaign metadata", async () => {
    const track = vi.fn();

    window.history.pushState(
      {},
      "",
      "/en?utm_source=google&utm_medium=cpc&utm_campaign=spring",
    );

    render(
      <ClientAnalyticsProvider analytics={{ track }}>
        <PublicAnalyticsRouteEvents
          metadata={{
            locale: "en",
          }}
          viewEventName="landing_viewed"
        />
      </ClientAnalyticsProvider>,
    );

    await waitFor(() => {
      expect(track).toHaveBeenCalledWith(
        "landing_viewed",
        expect.objectContaining({
          device_type: expect.any(String),
          locale: "en",
          path: "/en",
          utm_campaign: "spring",
          utm_medium: "cpc",
          utm_source: "google",
        }),
      );
    });
  });

  it("tracks marked public clicks without reading visible contact text", async () => {
    const user = userEvent.setup();
    const track = vi.fn();

    render(
      <ClientAnalyticsProvider analytics={{ track }}>
        <PublicAnalyticsRouteEvents viewEventName="landing_viewed" />
        <a
          data-analytics-contact-method="email"
          data-analytics-event="contact_link_clicked"
          href="mailto:sailor@example.com"
        >
          sailor@example.com
        </a>
      </ClientAnalyticsProvider>,
    );

    await user.click(document.querySelector("a") as HTMLAnchorElement);

    expect(track).toHaveBeenCalledWith(
      "contact_link_clicked",
      expect.objectContaining({
        contact_method: "email",
      }),
    );
    expect(JSON.stringify(track.mock.calls)).not.toContain(
      "sailor@example.com",
    );
  });
});
