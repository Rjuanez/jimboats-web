import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getAdminNotificationsPreviewPage } from "@/interface/next/presenters/adminNotificationsPresenter";

import { AdminNotificationsWorkspace } from "./AdminNotificationsWorkspace";
import type { AdminNotificationActions } from "./AdminNotificationTypes";

const pageData = getAdminNotificationsPreviewPage();

const actions = {
  previewTemplate: async () => ({
    data: {
      missingVariables: [],
      renderedBody: "Hello Sailor Guest, booking JB-2026-PREVIEW is confirmed.",
      renderedHtmlBody:
        "<p>Hello Sailor Guest, booking <strong>JB-2026-PREVIEW</strong> is confirmed.</p>",
      renderedPreviewText: "Booking JB-2026-PREVIEW confirmed",
      renderedSubject: "Booking JB-2026-PREVIEW confirmed",
      variables: ["booking.reference", "customer.name"],
      warnings: [],
    },
    ok: true as const,
  }),
  saveRule: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true as const,
  }),
  saveTemplate: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true as const,
  }),
  sendDelivery: async () => ({
    data: {
      state: pageData.state,
    },
    ok: true as const,
  }),
} satisfies AdminNotificationActions;

const meta = {
  component: AdminNotificationsWorkspace,
  parameters: {
    layout: "fullscreen",
  },
  title: "Admin/Notifications/Workspace",
} satisfies Meta<typeof AdminNotificationsWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rules: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "rules",
  },
};

export const Templates: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "templates",
  },
};

export const TemplateDetail: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    templateId: "template-preview-email-created",
    view: "template-detail",
  },
};

export const Logs: Story = {
  args: {
    actions,
    initialState: pageData.state,
    navItems: pageData.navItems,
    view: "logs",
  },
};
