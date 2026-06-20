import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { PushNotificationsSetupDto } from "@/modules/notifications/application/PushNotificationDtos";

import type { AdminPushNotificationActions } from "./AdminPushNotificationTypes";
import { AdminPushNotificationsWorkspace } from "./AdminPushNotificationsWorkspace";

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

const meta = {
  args: {
    actions,
    setup,
  },
  component: AdminPushNotificationsWorkspace,
  title: "Admin/Push Notifications Workspace",
} satisfies Meta<typeof AdminPushNotificationsWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
