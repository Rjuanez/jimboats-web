import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PushNotificationsSetupDto } from "@/modules/notifications/application/PushNotificationDtos";

import type { AdminPushNotificationActions } from "./AdminPushNotificationTypes";
import { AdminPushNotificationsWorkspace } from "./AdminPushNotificationsWorkspace";

describe("AdminPushNotificationsWorkspace", () => {
  it("renders setup guidance and connected devices", async () => {
    render(
      <AdminPushNotificationsWorkspace actions={actions} setup={setup} />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Booking push notifications",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 active")).toBeInTheDocument();
    expect(screen.getByText("iPhone Pedro")).toBeInTheDocument();
    expect(screen.getByText("Activation code")).toBeInTheDocument();
  });
});

const actions: AdminPushNotificationActions = {
  async registerSubscription() {
    return {
      data: {
        subscription: setup.subscriptions[0],
      },
      ok: true,
    };
  },
  async sendTest() {
    return {
      data: {
        status: "SENT",
      },
      ok: true,
    };
  },
};

const setup: PushNotificationsSetupDto = {
  activationRequired: true,
  subscriptions: [
    {
      createdAt: "2026-06-20T09:00:00.000Z",
      disabledAt: null,
      displayMode: "standalone",
      endpoint: "https://push.example/subscription-1",
      id: "subscription-1",
      label: "iPhone Pedro",
      lastFailureAt: null,
      lastFailureReason: null,
      lastSuccessAt: "2026-06-20T10:00:00.000Z",
      lastTestSentAt: "2026-06-20T10:00:00.000Z",
      permission: "GRANTED",
      platform: "IOS",
      status: "ACTIVE",
      updatedAt: "2026-06-20T10:00:00.000Z",
      userAgent: "Mobile Safari",
    },
  ],
  vapidPublicKey: "public-key",
};
